# Ring Signature (Concept) vs ECDSA – React + ethers v6 Demo

This app demonstrates the idea of a ring signature using standard Ethereum ECDSA primitives from `ethers`. It is NOT a cryptographically correct ring signature implementation; instead, it visually and interactively contrasts:

- **ECDSA verification**: recovers the exact signer. The verifier knows precisely which address signed.
- **Conceptual ring verification**: checks only whether the recovered address is a member of a set (the “ring”), creating signer ambiguity among N members.

The app generates a ring of 5 addresses, lets one hidden member sign a message, and displays both verification modes. You can optionally connect a wallet (MetaMask) and use it as the hidden signer.

---

## Quick start

```bash
npm i
npm run dev
```

Then open the printed local URL in your browser.

---

## What this demo shows

- **Wallet connection** via `eth_requestAccounts`.
- **Message signing** using either a local ephemeral wallet or your connected wallet. For connected wallets, this triggers a `personal_sign`/`signMessage` prompt.
- **Verification**:
  - ECDSA: the recovered address must match exactly the hidden signer.
  - Ring (concept): the recovered address must belong to the ring; the exact member is not distinguished.
- **Visualization**: a circular ring shows the 5 members, highlights the hidden signer (optional) and the recovered signer.
- **Latest Ethereum request** panel: displays the last JSON-RPC request made (e.g., `eth_requestAccounts`, conceptual `(local ECDSA)`, or `personal_sign`).

---

## Why ring signatures?

ECDSA, the signature scheme used on Ethereum, ties a signature to a single keypair. Anyone can recover the exact signing address for a given message and signature. A ring signature scheme, by contrast, allows a signer to produce a signature that can be verified as originating from “someone in this set” without revealing exactly who in the set signed. This demo illustrates the intuition by:

1. Picking 5 addresses as the ring members.
2. Letting one hidden member sign a message.
3. Comparing two verifications:
   - ECDSA: Must equal the hidden signer’s address.
   - Ring (concept): Must be in the member set. The verifier learns only membership, not identity.

Again: this is an educational visualization. Real ring signatures require different cryptography than ECDSA.

---

## App architecture

- Framework: React + Vite
- Crypto: `ethers` v6
- Main UI/logic: `src/App.jsx`

State at a glance:

- `ringMembers`: Array of 5 entries, each `{ address, type: 'local'|'external', wallet? }`.
- `ringAddresses`: Array of 5 strings (addresses) derived from `ringMembers`.
- `hiddenIndex`: Integer index for the hidden signer.
- `message`: String to sign.
- `signature`: The produced signature string.
- `recoveredAddress`: Address recovered from `(message, signature)`.
- `useConnectedAsSigner`: Whether to use the connected wallet as the hidden signer.
- `connectedAddress`, `extSigner`: Wallet connection details from `ethers` `BrowserProvider`.
- `lastRpc`: The most recent Ethereum request shown in the panel.

---

## Core flows

### 1) Connect wallet

```js
const browserProvider = new BrowserProvider(window.ethereum)
await browserProvider.send('eth_requestAccounts', [])
const signer = await browserProvider.getSigner()
const addr = await signer.getAddress()
```

What you’ll see:
- A wallet pop-up asking for permission.
- The app shows the connected address and retains the signer for use in message signing.
- The “Latest Ethereum request” panel shows an example payload:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_requestAccounts",
  "params": []
}
```

### 2) Generate ring (5)

Two modes:
- Without a connected wallet, the app creates 5 local ephemeral wallets with `Wallet.createRandom()`.
- With “Use connected wallet as hidden signer” checked, the app creates 4 local wallets plus your connected address, then shuffles them.

The UI renders a circular ring of the 5 addresses. The hidden signer can be revealed with a toggle for learning/debug.

### 3) Sign with hidden member

Depending on the hidden member type:
- Local member: signs with `wallet.signMessage(message)`.
- Connected member: signs with `signer.signMessage(message)` and shows a `personal_sign` prompt in your wallet.

Example “Latest Ethereum request” when using a connected wallet:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "personal_sign",
  "params": ["<message>", "<connectedAddress>"]
}
```

### 4) Verify

- ECDSA verification uses `verifyMessage(message, signature)` to recover an address.
- The app shows two outcomes:
  - ECDSA: PASS only if `recoveredAddress === hiddenSignerAddress`.
  - Ring (concept): PASS if `recoveredAddress` is any member of the ring.

The ring diagram highlights the recovered signer in green. If the reveal toggle is on, the hidden signer is tagged in orange for comparison.

---

## Code references

Wallet connect and request:
```33:46:src/App.jsx
async function connectWallet() {
  if (!window.ethereum) { /* ... */ }
  const browserProvider = new BrowserProvider(window.ethereum)
  await browserProvider.send('eth_requestAccounts', [])
  const signer = await browserProvider.getSigner()
  const addr = await signer.getAddress()
  // store signer/address; record lastRpc
}
```

Ring generation:
```69:96:src/App.jsx
async function generateRing() {
  // builds 5-member ring; optionally includes connected wallet
}
```

Signing and verification:
```110:128:src/App.jsx
async function signWithHiddenMember() {
  // signs with local or external signer; records lastRpc
  const recovered = verifyMessage(message, sig)
}
```

Visualization layout:
```205:249:src/App.jsx
// circular layout with CSS absolute positioning, highlighting states
```

---

## Limitations and disclaimers

- This is NOT a real ring signature scheme. It intentionally uses Ethereum ECDSA to illustrate the difference between exact-signer verification and set-membership verification.
- Real ring signatures rely on specialized cryptography (e.g., based on different hardness assumptions) and produce signatures that do not leak the exact signer.
- Security considerations like message domain separation, replay protection, and signature malleability are beyond this demo’s scope.

---

## Extending this demo

- Add step-by-step animation: shuffle/mix phases, progressive highlighting.
- Swap the ring size: input for N and dynamic layout.
- Use real ring signature schemes in the browser (e.g., via WASM) to compare outputs.
- Persist rings across refreshes (localStorage) and allow exporting/importing sets.

---

## Troubleshooting

- “No Ethereum provider found”: Install MetaMask or another EIP-1193 provider.
- Personal sign prompt not appearing: ensure the connected account is selected and the site has permission.
- Recovered address not in ring: regenerate the ring; ensure you signed the current message.

---

## License

MIT
