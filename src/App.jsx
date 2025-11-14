import { useMemo, useState } from 'react'
import './App.css'
import { Wallet, verifyMessage, BrowserProvider } from 'ethers'
import RingSignatureExplanation from './RingSignatureExplanation'
import { generateSimplifiedRingSignature, verifyRingSignature, getPrivateKeyBytes } from './ringSignature'

function App() {
  const [currentPage, setCurrentPage] = useState('demo') // 'demo' or 'explanation'
  const [ringMembers, setRingMembers] = useState([]) // [{ address, type: 'local'|'external', wallet? }]
  const [ringAddresses, setRingAddresses] = useState([])
  const [hiddenIndex, setHiddenIndex] = useState(null)
  const [message, setMessage] = useState('Ring signatures provide signer ambiguity.')
  const [signature, setSignature] = useState(null)
  const [ringSignature, setRingSignature] = useState(null) // True ring signature object
  const [recoveredAddress, setRecoveredAddress] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  const [revealSigner, setRevealSigner] = useState(false)
  const [extSigner, setExtSigner] = useState(null)
  const [connectedAddress, setConnectedAddress] = useState(null)
  const [network, setNetwork] = useState(null)
  const [lastRpc, setLastRpc] = useState(null)
  const [isFetchingEtherscan, setIsFetchingEtherscan] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const anonymitySetSize = useMemo(() => ringAddresses.length, [ringAddresses])

  const hasRing = ringAddresses.length === 5
  const canSign = hasRing && connectedAddress && extSigner && message.trim().length > 0

  async function connectWallet() {
    if (!window.ethereum) {
      alert('No Ethereum provider found. Please install MetaMask.')
      return
    }
    const browserProvider = new BrowserProvider(window.ethereum)
    await browserProvider.send('eth_requestAccounts', [])
    setLastRpc({ method: 'eth_requestAccounts', params: [] })
    const signer = await browserProvider.getSigner()
    const addr = await signer.getAddress()
    setExtSigner(signer)
    setConnectedAddress(addr)
    try {
      const net = await browserProvider.getNetwork()
      setNetwork({ chainId: Number(net.chainId), name: net.name })
    } catch {
      setNetwork(null)
    }
  }

  function generateUniqueRandomWallets(excludeAddresses, count) {
    const lowerExcludes = new Set(excludeAddresses.map(a => a.toLowerCase()))
    const wallets = []
    const addresses = new Set()
    while (wallets.length < count) {
      const w = Wallet.createRandom()
      const addr = w.address
      if (lowerExcludes.has(addr.toLowerCase())) continue
      if (addresses.has(addr.toLowerCase())) continue
      addresses.add(addr.toLowerCase())
      wallets.push(w)
    }
    return wallets
  }

  async function generateRing() {
    if (!connectedAddress) {
      alert('Please connect your wallet first')
      return
    }
    
    const locals = generateUniqueRandomWallets([connectedAddress], 4)
    const members = [
      { address: connectedAddress, type: 'external' },
      ...locals.map(w => ({ address: w.address, type: 'local', wallet: w })),
    ]
    // shuffle so connected wallet is not always index 0
    const shuffled = members
      .map(v => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ v }) => v)
    
    const addresses = shuffled.map(m => m.address)
    setRingMembers(shuffled)
    setRingAddresses(addresses)
    setHiddenIndex(addresses.findIndex(a => a.toLowerCase() === connectedAddress.toLowerCase()))
    setSignature(null)
    setRingSignature(null)
    setRecoveredAddress(null)
    setVerificationResult(null)
  }

  async function signWithHiddenMember() {
    if (!canSign) return
    if (!extSigner || !connectedAddress) {
      alert('Please connect your wallet first')
      return
    }
    
    try {
      setVerificationResult(null)
      // Check if we have a local wallet (with private key) for the signer
      const signerMember = ringMembers[hiddenIndex]
      let privateKey = null
      
      if (signerMember?.type === 'local' && signerMember?.wallet) {
        // Local wallet - we have the private key, can generate true ring signature
        privateKey = signerMember.wallet.privateKey
        const privateKeyBytes = getPrivateKeyBytes(privateKey)
        
        // Generate true ring signature
        const ringSig = generateSimplifiedRingSignature(
          message,
          privateKeyBytes,
          ringAddresses,
          hiddenIndex
        )
        
        setRingSignature(ringSig)
        setLastRpc({ method: 'ring_signature', params: [message, ringAddresses, hiddenIndex] })
        
        // Also store traditional signature for comparison
        const traditionalSig = await signerMember.wallet.signMessage(message)
        setSignature(traditionalSig)
        setRecoveredAddress(null)
      } else {
        // External wallet (MetaMask) - we can't access private key
        // For external wallets, we'll use traditional ECDSA but structure it as ring
        setLastRpc({ method: 'personal_sign', params: [message, connectedAddress] })
        const sig = await extSigner.signMessage(message)
        setSignature(sig)
        setRecoveredAddress(null)
        
        // Create a ring signature structure even though we used ECDSA
        // This demonstrates the concept but isn't a true ring sig
        const ringSig = {
          ring: ringAddresses,
          signerIndex: hiddenIndex,
          message,
          signature: {
            type: 'ecdsa_concept',
            signature: sig,
            note: 'External wallet - using ECDSA signature (true ring sig requires private key access)'
          }
        }
        setRingSignature(ringSig)
      }
    } catch (error) {
      console.error('Error signing:', error)
      alert('Error generating signature: ' + error.message)
    }
  }

  async function fetchFourAddressesFromEtherscan() {
    if (!connectedAddress) {
      alert('Please connect your wallet first')
      return
    }
    
    setFetchError(null)
    const apiKey = "FYYKM5131QH86W8MZGRF2W9DEGA3JPTF1X"
    if (!apiKey) {
      setFetchError('Missing VITE_ETHERSCAN_API_KEY in environment')
      return
    }
    try {
      setIsFetchingEtherscan(true)
      // 1) Get latest block number using V2 API (JSON-RPC format)
      const bnRes = await fetch(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_blockNumber&apikey=${apiKey}`)
      const bnJson = await bnRes.json()
      if (bnJson.error || !bnJson.result) {
        throw new Error(bnJson.error?.message || 'Failed to get latest block number')
      }
      const latestHex = bnJson.result
      // 2) Get block by number with full tx objects using V2 API (JSON-RPC format)
      const blkRes = await fetch(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=${latestHex}&boolean=true&apikey=${apiKey}`)
      const blkJson = await blkRes.json()
      if (blkJson.error || !blkJson.result) {
        throw new Error(blkJson.error?.message || 'Failed to get block details')
      }
      const txs = blkJson.result.transactions || []
      // 3) Collect unique addresses from recent transactions, excluding connected address
      const uniq = new Set()
      const connectedLower = connectedAddress.toLowerCase()
      for (const tx of txs) {
        if (tx?.from && tx.from.toLowerCase() !== connectedLower) {
          uniq.add(tx.from.toLowerCase())
        }
        if (tx?.to && tx.to.toLowerCase() !== connectedLower) {
          uniq.add(tx.to.toLowerCase())
        }
        if (uniq.size >= 10) break // collect enough to sample from
      }
      const addrList = Array.from(uniq)
      if (addrList.length < 4) throw new Error('Not enough addresses in the latest block (excluding your wallet)')
      // 4) Pick first 4 and combine with connected wallet
      const four = addrList.slice(0, 4)
      const allAddresses = [
        { address: connectedAddress, type: 'external' },
        ...four.map(a => ({ address: a, type: 'external' }))
      ]
      // shuffle so connected wallet is not always index 0
      const shuffled = allAddresses
        .map(v => ({ v, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ v }) => v)
      
      const addresses = shuffled.map(m => m.address)
      setRingMembers(shuffled)
      setRingAddresses(addresses)
      setHiddenIndex(addresses.findIndex(a => a.toLowerCase() === connectedAddress.toLowerCase()))
      setSignature(null)
      setRingSignature(null)
      setRecoveredAddress(null)
      setVerificationResult(null)
    } catch (e) {
      setFetchError(e?.message || 'Failed to fetch from Etherscan')
    } finally {
      setIsFetchingEtherscan(false)
    }
  }

  function decodeAndVerifySignature() {
    if (!ringSignature) {
      alert('Generate a ring signature first')
      return
    }

    try {
      if (ringSignature.signature?.type === 'ring_ecdsa_concept') {
        const verification = verifyRingSignature(message, ringSignature, ringAddresses)
        if (verification.recoveredPublicKey) {
          setRecoveredAddress(verification.recoveredPublicKey)
        }
        setVerificationResult({
          type: 'ring',
          pass: verification.valid && verification.inRing,
          message: verification.valid && verification.inRing
            ? `Cryptographically verified: signer is one of ${ringAddresses.length} ring members.`
            : verification.error || 'Ring verification failed.',
          details: verification
        })
      } else {
        const signatureToVerify = ringSignature.signature?.signature || signature
        if (!signatureToVerify) {
          throw new Error('Missing ECDSA signature payload')
        }
        const recovered = verifyMessage(message, signatureToVerify)
        setRecoveredAddress(recovered)
        const inRing = ringAddresses.some(addr => addr.toLowerCase() === recovered.toLowerCase())
        setVerificationResult({
          type: 'ecdsa',
          pass: inRing,
          message: inRing
            ? 'Recovered signer belongs to the current ring.'
            : 'Recovered signer is outside of the current ring.',
          details: { recovered }
        })
      }
    } catch (error) {
      setVerificationResult({
        type: 'error',
        pass: false,
        message: error?.message || 'Failed to decode signature.'
      })
    }
  }

  // Demo component content
  const DemoContent = () => (
    <>
      <h1>Ring Signature (Concept) vs ECDSA</h1>
      <p style={{ marginTop: 8, lineHeight: 1.5 }}>
        Follow the two steps below to create a ring signature and then decode it to
        confirm whether the signer belongs to the anonymity set.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Step 1 · Generate the Ring Signature</h2>
        <p style={{ marginTop: 6, opacity: 0.75 }}>
          Connect your wallet, build a ring of 5 addresses, choose a message, then sign to
          produce a ring signature payload.
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button onClick={connectWallet}>Connect Wallet</button>
          {connectedAddress && (
            <span style={{ alignSelf: 'center', opacity: 0.85 }}>
              Connected: <code>{connectedAddress}</code>
            </span>
          )}
        </div>
        {(connectedAddress || network) && (
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
            {network && (
              <span style={{ marginRight: 12 }}>Chain: <b>{network.name || 'unknown'}</b> (id {network.chainId})</span>
            )}
          </div>
        )}
        {!connectedAddress && (
          <div style={{ marginTop: 12, padding: 12, background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: 6 }}>
            Connect your wallet to continue. It will act as the hidden signer.
          </div>
        )}

        {connectedAddress && !hasRing && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Create a 5-member ring</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={generateRing}>Generate Ring (Your wallet + 4 random)</button>
              <button onClick={fetchFourAddressesFromEtherscan} disabled={isFetchingEtherscan}>
                Fetch 4 from Etherscan + Your wallet
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              Your wallet (<code>{connectedAddress.slice(0, 8)}…{connectedAddress.slice(-6)}</code>) is hidden within the ring.
            </div>
          </div>
        )}
        {isFetchingEtherscan && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid #888',
              borderTopColor: '#fff',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ opacity: 0.9 }}>Fetching 4 addresses from Etherscan…</span>
          </div>
        )}
        {fetchError && (
          <div style={{ marginTop: 8, color: 'orangered' }}>{fetchError}</div>
        )}

        {hasRing && (
          <>
            <div style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Message to sign</div>
              <input
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setVerificationResult(null)
                }}
                placeholder="Enter message to sign"
                style={{ width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={signWithHiddenMember} disabled={!canSign}>
                Generate Ring Signature
              </button>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={revealSigner} onChange={(e) => setRevealSigner(e.target.checked)} />
                Reveal signer (debug)
              </label>
            </div>

            <div style={{ marginTop: 20 }}>
              <h3 style={{ marginTop: 0 }}>Ring Members ({anonymitySetSize})</h3>
              <div style={{ position: 'relative', height: 260, marginBottom: 12, border: '1px dashed #555', borderRadius: 8 }}>
                {ringAddresses.map((addr, idx) => {
                  const n = ringAddresses.length
                  const angle = (2 * Math.PI * idx) / n - Math.PI / 2
                  const radius = 100
                  const dx = radius * Math.cos(angle)
                  const dy = radius * Math.sin(angle)
                  const isHidden = hiddenIndex === idx
                  const isRecovered = recoveredAddress && addr.toLowerCase() === recoveredAddress.toLowerCase()
                  const border = isRecovered ? '3px solid limegreen' : isHidden && revealSigner ? '2px dashed orange' : '2px solid #888'
                  const bg = isRecovered ? 'rgba(50,205,50,0.15)' : isHidden && revealSigner ? 'rgba(255,165,0,0.12)' : 'rgba(255,255,255,0.06)'
                  return (
                    <div
                      key={addr}
                      style={{
                        position: 'absolute',
                        left: `calc(50% + ${dx}px - 36px)`,
                        top: `calc(50% + ${dy}px - 36px)`,
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        border,
                        background: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: 6,
                        fontSize: 11,
                        lineHeight: 1.2,
                        animation: 'fadeIn 400ms ease-out'
                      }}
                      title={addr}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{idx + 1}</div>
                        <div style={{ opacity: 0.85 }}>{addr.slice(0, 6)}…{addr.slice(-4)}</div>
                      </div>
                    </div>
                  )
                })}
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Ring</div>
                  <div style={{ fontWeight: 700 }}>5 members</div>
                </div>
              </div>
              <ol style={{ paddingLeft: 18 }}>
                {ringAddresses.map((addr, idx) => (
                  <li key={addr} style={{ marginBottom: 6 }}>
                    <code>{addr}</code>
                    {hiddenIndex === idx && (
                      <span style={{ marginLeft: 8, fontWeight: 600 }}>
                        {revealSigner ? ' (hidden signer)' : ' (hidden)'}
                      </span>
                    )}
                    {connectedAddress && addr.toLowerCase() === connectedAddress.toLowerCase() && (
                      <span style={{ marginLeft: 8, opacity: 0.85 }}>(connected)</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}

        {ringSignature && (
          <div style={{ marginTop: 20, padding: 12, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: 6 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#4CAF50' }}>
              {ringSignature.signature?.type === 'ring_ecdsa_concept' ? '✅ True Ring Signature generated' : '⚠️ Conceptual Ring Signature generated'}
            </div>
            {ringSignature.signature?.type === 'ring_ecdsa_concept' ? (
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <div><strong>Ring Hash:</strong> <code style={{ fontSize: 11 }}>{ringSignature.signature.ringHash?.slice(0, 20)}…</code></div>
                <div><strong>Signature R:</strong> <code style={{ fontSize: 11 }}>{ringSignature.signature.r?.slice(0, 20)}…</code></div>
                <div><strong>Signature S:</strong> <code style={{ fontSize: 11 }}>{ringSignature.signature.s?.slice(0, 20)}…</code></div>
                <div style={{ marginTop: 8, opacity: 0.9 }}>
                  Ready for decoding in Step 2.
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <div><strong>Type:</strong> ECDSA Signature (conceptual ring)</div>
                <div style={{ marginTop: 8, opacity: 0.9 }}>
                  {ringSignature.signature?.note || 'Using standard ECDSA - true ring signature requires private key access.'}
                </div>
              </div>
            )}
          </div>
        )}

        {signature && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600 }}>Raw Signature Payload</div>
            <code style={{ wordBreak: 'break-all', fontSize: 12 }}>{signature.slice(0, 66)}…</code>
          </div>
        )}

        {lastRpc && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Latest Ethereum request</div>
            <pre style={{ margin: 0, overflowX: 'auto', padding: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid #444', borderRadius: 6 }}>
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "${lastRpc.method}",
  "params": ${JSON.stringify(lastRpc.params, null, 2)}
}`}
            </pre>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0 }}>Step 2 · Decode & Verify</h2>
        <p style={{ marginTop: 6, opacity: 0.75 }}>
          Decode the signature payload, recover the signer, and check whether it belongs to the ring.
        </p>
        <button
          onClick={decodeAndVerifySignature}
          disabled={!ringSignature}
          style={{ marginTop: 12 }}
        >
          Decode Signature & Run Verification
        </button>
        {!ringSignature && (
          <div style={{ marginTop: 10, opacity: 0.8 }}>
            Generate a ring signature in Step 1 to enable decoding.
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 600 }}>Recovered Public Key / Address</div>
          <code style={{ fontSize: 12 }}>{recoveredAddress || 'N/A'}</code>
        </div>

        {verificationResult && (
          <div style={{ marginTop: 16, border: '1px solid #444', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Result:{' '}
              {verificationResult.pass ? (
                <span style={{ color: 'limegreen' }}>PASS</span>
              ) : (
                <span style={{ color: 'orangered' }}>FAIL</span>
              )}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              {verificationResult.message}
            </div>
            {verificationResult.type === 'ring' && verificationResult.details?.inRing && (
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                ✅ Signer confirmed within the {anonymitySetSize}-member ring.
              </div>
            )}
            {verificationResult.type === 'ecdsa' && verificationResult.details?.recovered && (
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                Recovered signer: <code>{verificationResult.details.recovered}</code>
              </div>
            )}
          </div>
        )}
      </div>

  
    </>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      {/* Page Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 24,
        borderBottom: '2px solid #444',
        paddingBottom: 16
      }}>
        <button
          onClick={() => setCurrentPage('demo')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: 6,
            background: currentPage === 'demo' 
              ? 'rgba(76, 175, 80, 0.3)' 
              : 'rgba(255,255,255,0.05)',
            color: currentPage === 'demo' ? '#4CAF50' : '#fff',
            cursor: 'pointer',
            fontWeight: currentPage === 'demo' ? 600 : 400,
            borderBottom: currentPage === 'demo' ? '3px solid #4CAF50' : '3px solid transparent',
            transition: 'all 0.2s',
            fontSize: 16
          }}
        >
          🧪 Interactive Demo
        </button>
        <button
          onClick={() => setCurrentPage('explanation')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: 6,
            background: currentPage === 'explanation' 
              ? 'rgba(76, 175, 80, 0.3)' 
              : 'rgba(255,255,255,0.05)',
            color: currentPage === 'explanation' ? '#4CAF50' : '#fff',
            cursor: 'pointer',
            fontWeight: currentPage === 'explanation' ? 600 : 400,
            borderBottom: currentPage === 'explanation' ? '3px solid #4CAF50' : '3px solid transparent',
            transition: 'all 0.2s',
            fontSize: 16
          }}
        >
          📚 How It Works
        </button>
      </div>

      {/* Render current page */}
      {currentPage === 'demo' ? (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <DemoContent />
        </div>
      ) : (
        <RingSignatureExplanation />
      )}
    </div>
  )
}

export default App
