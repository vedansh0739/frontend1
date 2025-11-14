import { useState } from 'react'

function RingSignatureExplanation() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: "What is a Ring Signature?",
      content: (
        <div>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            A <strong>ring signature</strong> is a type of digital signature that allows a member of a group
            (called a "ring") to sign a message anonymously. The signature proves that someone in the ring
            signed the message, but it doesn't reveal which specific member did it.
          </p>
          <div style={{ 
            background: 'rgba(50, 150, 255, 0.1)', 
            border: '1px solid rgba(50, 150, 255, 0.3)', 
            borderRadius: 8, 
            padding: 16,
            marginTop: 16
          }}>
            <h3 style={{ marginTop: 0 }}>Key Properties:</h3>
            <ul style={{ lineHeight: 1.8 }}>
              <li><strong>Anonymity:</strong> The actual signer cannot be identified</li>
              <li><strong>Unlinkability:</strong> Multiple signatures from the same signer cannot be linked</li>
              <li><strong>No Setup Required:</strong> Ring members don't need to coordinate beforehand</li>
              <li><strong>Verifiability:</strong> Anyone can verify the signature is valid</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "How Ring Signatures Work",
      content: (
        <div>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            Ring signatures use advanced cryptography to create a signature that could have been produced
            by any member of the ring, making it impossible to determine the actual signer.
          </p>
          
          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>The Process:</h3>
            
            <div style={{ 
              display: 'grid', 
              gap: 16,
              marginTop: 20
            }}>
              {/* Step 1 */}
              <div style={{ 
                border: '1px solid #444', 
                borderRadius: 8, 
                padding: 16,
                background: 'rgba(255,255,255,0.03)'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#4CAF50' }}>
                  Step 1: Form the Ring
                </div>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  A group of public keys (addresses) is selected. This forms the "ring" or "anonymity set".
                  The actual signer's public key is included in this ring.
                </p>
                <div style={{ 
                  marginTop: 12, 
                  display: 'flex', 
                  justifyContent: 'center',
                  gap: 8,
                  flexWrap: 'wrap'
                }}>
                  {['Alice', 'Bob', 'Charlie', 'Diana', 'You'].map((name, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        border: idx === 4 ? '3px solid #FFA500' : '2px solid #888',
                        background: idx === 4 ? 'rgba(255,165,0,0.2)' : 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: idx === 4 ? 700 : 400
                      }}
                    >
                      {name}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
                  Ring of 5 members (You are the hidden signer)
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ 
                border: '1px solid #444', 
                borderRadius: 8, 
                padding: 16,
                background: 'rgba(255,255,255,0.03)'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#2196F3' }}>
                  Step 2: Generate the Signature
                </div>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  The actual signer uses their private key to create a signature. The cryptographic algorithm
                  ensures the signature could have been produced by any member of the ring.
                </p>
                <div style={{ 
                  marginTop: 12,
                  padding: 12,
                  background: 'rgba(33, 150, 243, 0.1)',
                  borderRadius: 6,
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    Signature = RingSign(message, private_key, ring_public_keys)
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ 
                border: '1px solid #444', 
                borderRadius: 8, 
                padding: 16,
                background: 'rgba(255,255,255,0.03)'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#9C27B0' }}>
                  Step 3: Verify the Signature
                </div>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Anyone can verify the signature using only the public keys in the ring. The verification
                  confirms that someone in the ring signed the message, but cannot identify who.
                </p>
                <div style={{ 
                  marginTop: 12,
                  padding: 12,
                  background: 'rgba(156, 39, 176, 0.1)',
                  borderRadius: 6,
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    background: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 14
                  }}>
                    ✓
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <strong>Verification Result:</strong> Signature is valid, signer is one of the 5 ring members
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ring Signature vs ECDSA",
      content: (
        <div>
          <p style={{ lineHeight: 1.8, marginBottom: 24 }}>
            Traditional ECDSA signatures reveal the exact signer, while ring signatures provide anonymity.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* ECDSA */}
            <div style={{ 
              border: '1px solid #444', 
              borderRadius: 8, 
              padding: 16,
              background: 'rgba(255,255,255,0.03)'
            }}>
              <h3 style={{ marginTop: 0, color: '#F44336' }}>ECDSA Signature</h3>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Signer Identity:</div>
                <div style={{ 
                  padding: 8, 
                  background: 'rgba(244, 67, 54, 0.1)',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12
                }}>
                  Publicly Revealed
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Anonymity:</div>
                <div style={{ color: '#F44336' }}>❌ None</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Use Case:</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>
                  Standard transactions where signer identity is required
                </div>
              </div>
              <div style={{ 
                marginTop: 16,
                padding: 12,
                background: 'rgba(244, 67, 54, 0.1)',
                borderRadius: 6,
                fontSize: 12
              }}>
                <strong>Example:</strong> Alice signs → Everyone knows Alice signed
              </div>
            </div>

            {/* Ring Signature */}
            <div style={{ 
              border: '1px solid #444', 
              borderRadius: 8, 
              padding: 16,
              background: 'rgba(255,255,255,0.03)'
            }}>
              <h3 style={{ marginTop: 0, color: '#4CAF50' }}>Ring Signature</h3>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Signer Identity:</div>
                <div style={{ 
                  padding: 8, 
                  background: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12
                }}>
                  Hidden (Anonymized)
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Anonymity:</div>
                <div style={{ color: '#4CAF50' }}>✅ Full (within ring)</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Use Case:</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>
                  Privacy-preserving transactions, anonymous voting, confidential communications
                </div>
              </div>
              <div style={{ 
                marginTop: 16,
                padding: 12,
                background: 'rgba(76, 175, 80, 0.1)',
                borderRadius: 6,
                fontSize: 12
              }}>
                <strong>Example:</strong> Alice signs → Everyone knows someone in the ring signed, but not who
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Visualization: The Ring Structure",
      content: (
        <div>
          <p style={{ lineHeight: 1.8, marginBottom: 24 }}>
            The ring structure visually represents how members are connected in the signature process.
          </p>

          <div style={{ 
            position: 'relative', 
            height: 400, 
            marginBottom: 24, 
            border: '2px dashed #555', 
            borderRadius: 12,
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Ring visualization */}
            {[0, 1, 2, 3, 4].map((idx) => {
              const n = 5
              const angle = (2 * Math.PI * idx) / n - Math.PI / 2
              const radius = 140
              const dx = radius * Math.cos(angle)
              const dy = radius * Math.sin(angle)
              const isSigner = idx === 0
              
              return (
                <div key={idx}>
                  {/* Connection line */}
                  <svg
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}
                  >
                    <line
                      x1="50%"
                      y1="50%"
                      x2={`calc(50% + ${dx}px)`}
                      y2={`calc(50% + ${dy}px)`}
                      stroke={isSigner ? '#FFA500' : '#666'}
                      strokeWidth="2"
                      strokeDasharray={isSigner ? "0" : "5,5"}
                      opacity={0.4}
                    />
                  </svg>
                  
                  {/* Member circle */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${dx}px - 50px)`,
                      top: `calc(50% + ${dy}px - 50px)`,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      border: isSigner ? '4px solid #FFA500' : '3px solid #888',
                      background: isSigner 
                        ? 'rgba(255,165,0,0.2)' 
                        : 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      boxShadow: isSigner ? '0 0 20px rgba(255,165,0,0.5)' : 'none'
                    }}
                  >
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: 18,
                      marginBottom: 4,
                      color: isSigner ? '#FFA500' : '#fff'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div style={{ 
                      fontSize: 11, 
                      opacity: 0.8,
                      textAlign: 'center',
                      padding: '0 4px'
                    }}>
                      {isSigner ? 'Signer' : 'Member'}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Center */}
            <div style={{ 
              position: 'absolute', 
              left: '50%', 
              top: '50%', 
              transform: 'translate(-50%,-50%)', 
              textAlign: 'center',
              zIndex: 2,
              background: 'rgba(0,0,0,0.6)',
              padding: '12px 20px',
              borderRadius: 8,
              border: '2px solid #4CAF50'
            }}>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>Ring Signature</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#4CAF50' }}>5 Members</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Anonymity Set</div>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: 12,
            marginTop: 24
          }}>
            {['A', 'B', 'C', 'D', 'E'].map((label, idx) => {
              const isSigner = idx === 0
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #444',
                    borderRadius: 8,
                    padding: 12,
                    textAlign: 'center',
                    background: isSigner ? 'rgba(255,165,0,0.1)' : 'rgba(255,255,255,0.03)'
                  }}
                >
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 700,
                    marginBottom: 8,
                    color: isSigner ? '#FFA500' : '#fff'
                  }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {isSigner ? 'Actual Signer' : 'Ring Member'}
                  </div>
                  <div style={{ 
                    fontSize: 11, 
                    marginTop: 8,
                    padding: 4,
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 4,
                    fontFamily: 'monospace'
                  }}>
                    {isSigner ? '✓ Signs' : 'Could sign'}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ 
            marginTop: 24,
            padding: 16,
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 8
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Key Insight:</div>
            <p style={{ margin: 0, lineHeight: 1.8 }}>
              The ring signature is constructed so that <strong>any</strong> of the 5 members could have
              produced it. The cryptographic proof ensures that exactly one member signed, but makes it
              computationally infeasible to determine which one. This provides <strong>1-in-5 anonymity</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Real-World Applications",
      content: (
        <div>
          <p style={{ lineHeight: 1.8, marginBottom: 24 }}>
            Ring signatures have practical applications in privacy-preserving systems:
          </p>

          <div style={{ display: 'grid', gap: 16 }}>
            {[
              {
                title: "Privacy Coins",
                icon: "💰",
                description: "Cryptocurrencies like Monero use ring signatures to hide transaction senders, providing financial privacy.",
                example: "When you send Monero, the transaction appears to come from any member of the ring, not just you."
              },
              {
                title: "Anonymous Voting",
                icon: "🗳️",
                description: "Ring signatures can enable verifiable voting where votes are counted but voter identity remains secret.",
                example: "Board members vote on a proposal - everyone knows a valid vote was cast, but not who voted which way."
              },
              {
                title: "Whistleblowing",
                icon: "📢",
                description: "Journalists and whistleblowers can authenticate messages without revealing their identity.",
                example: "A leak is verified as coming from someone in a trusted group, but the specific source stays anonymous."
              },
              {
                title: "Confidential Communications",
                icon: "🔒",
                description: "Organizations can prove messages come from authorized members without identifying the sender.",
                example: "A company's security team issues an alert - verified as legitimate, but individual member privacy is protected."
              }
            ].map((app, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #444',
                  borderRadius: 8,
                  padding: 16,
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  gap: 16
                }}
              >
                <div style={{ 
                  fontSize: 48,
                  lineHeight: 1,
                  flexShrink: 0
                }}>
                  {app.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>{app.title}</h3>
                  <p style={{ margin: 0, marginBottom: 12, lineHeight: 1.7, opacity: 0.9 }}>
                    {app.description}
                  </p>
                  <div style={{ 
                    padding: 10,
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 6,
                    fontSize: 13,
                    fontStyle: 'italic',
                    opacity: 0.8
                  }}>
                    "{app.example}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Limitations & Considerations",
      content: (
        <div>
          <p style={{ lineHeight: 1.8, marginBottom: 24 }}>
            While ring signatures provide strong privacy guarantees, there are important considerations:
          </p>

          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ 
              border: '1px solid #F44336', 
              borderRadius: 8, 
              padding: 16,
              background: 'rgba(244, 67, 54, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#F44336' }}>⚠️ Anonymity Set Size</h3>
              <p style={{ margin: 0, lineHeight: 1.8 }}>
                The larger the ring, the better the anonymity. A ring of 5 provides 1-in-5 anonymity,
                while a ring of 100 provides 1-in-100. However, larger rings require more computation.
              </p>
            </div>

            <div style={{ 
              border: '1px solid #FF9800', 
              borderRadius: 8, 
              padding: 16,
              background: 'rgba(255, 152, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#FF9800' }}>⚠️ Ring Member Selection</h3>
              <p style={{ margin: 0, lineHeight: 1.8 }}>
                If ring members are predictable or controlled by an attacker, anonymity can be compromised.
                Real systems use techniques like decoy selection to maintain privacy.
              </p>
            </div>

            <div style={{ 
              border: '1px solid #2196F3', 
              borderRadius: 8, 
              padding: 16,
              background: 'rgba(33, 150, 243, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#2196F3' }}>ℹ️ Computational Cost</h3>
              <p style={{ margin: 0, lineHeight: 1.8 }}>
                Ring signatures are more computationally expensive than standard ECDSA signatures because
                they must generate cryptographic proofs for all ring members. This can impact transaction
                fees and processing time.
              </p>
            </div>

            <div style={{ 
              border: '1px solid #9C27B0', 
              borderRadius: 8, 
              padding: 16,
              background: 'rgba(156, 39, 176, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#9C27B0' }}>ℹ️ Linkability</h3>
              <p style={{ margin: 0, lineHeight: 1.8 }}>
                While individual signatures are unlinkable, advanced analysis techniques (like timing attacks
                or metadata analysis) might still reveal patterns. Real-world implementations use additional
                techniques to mitigate these risks.
              </p>
            </div>
          </div>

          <div style={{ 
            marginTop: 24,
            padding: 16,
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 8
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Note About This Demo:</div>
            <p style={{ margin: 0, lineHeight: 1.8 }}>
              This demo uses <strong>ECDSA signatures</strong> and only checks membership in the ring for
              verification. This is a <strong>conceptual demonstration</strong> - real ring signatures use
              different cryptographic primitives (like linkable ring signatures or confidential transactions)
              that don't require the private keys of all ring members and provide stronger anonymity guarantees.
            </p>
          </div>
        </div>
      )
    }
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Understanding Ring Signatures</h1>
      <p style={{ marginTop: 0, marginBottom: 24, fontSize: 16, opacity: 0.9 }}>
        A comprehensive guide to how ring signatures work and why they matter for privacy
      </p>

      {/* Step Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 24,
        flexWrap: 'wrap',
        borderBottom: '2px solid #444',
        paddingBottom: 16
      }}>
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: 6,
              background: activeStep === idx 
                ? 'rgba(76, 175, 80, 0.3)' 
                : 'rgba(255,255,255,0.05)',
              color: activeStep === idx ? '#4CAF50' : '#fff',
              cursor: 'pointer',
              fontWeight: activeStep === idx ? 600 : 400,
              borderBottom: activeStep === idx ? '3px solid #4CAF50' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {idx + 1}. {step.title}
          </button>
        ))}
      </div>

      {/* Active Step Content */}
      <div className="card" style={{ minHeight: 400 }}>
        <h2 style={{ marginTop: 0, marginBottom: 20, color: '#4CAF50' }}>
          {steps[activeStep].title}
        </h2>
        {steps[activeStep].content}
      </div>

      {/* Navigation Arrows */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: 24,
        gap: 16
      }}>
        <button
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: 6,
            background: activeStep === 0 
              ? 'rgba(255,255,255,0.05)' 
              : 'rgba(33, 150, 243, 0.2)',
            color: activeStep === 0 ? '#666' : '#2196F3',
            cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          ← Previous
        </button>
        <div style={{ 
          alignSelf: 'center', 
          opacity: 0.7,
          fontSize: 14
        }}>
          Step {activeStep + 1} of {steps.length}
        </div>
        <button
          onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
          disabled={activeStep === steps.length - 1}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: 6,
            background: activeStep === steps.length - 1 
              ? 'rgba(255,255,255,0.05)' 
              : 'rgba(33, 150, 243, 0.2)',
            color: activeStep === steps.length - 1 ? '#666' : '#2196F3',
            cursor: activeStep === steps.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default RingSignatureExplanation

