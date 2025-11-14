import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9d58e915c93b3660816c722ad8d931c51c1110e6";

// Minimal ABI for the provided SimpleStore contract
const SIMPLE_STORE_ABI = [
  "function setNumber(uint256 _num)",
  "function getNumber() view returns (uint256)",
  "function changeOwner(address _newOwner)",
  "function getOwner() view returns (address)"
];

function getRpcUrl() {
  const envUrl = process.env.SEPOLIA_RPC_URL;
  if (envUrl && envUrl.trim().length > 0) return envUrl.trim();
  // Fallback public endpoint (best effort; rate-limited). Prefer setting SEPOLIA_RPC_URL.
  return "https://rpc.sepolia.org";
}

function getProvider() {
  const rpcUrl = getRpcUrl();
  return new ethers.JsonRpcProvider(rpcUrl);
}

function normalizePrivateKey(raw) {
  const trimmed = raw.trim();
  const hex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "PRIVATE_KEY must be a 32-byte hex string like 0x<64 hex chars>. If you intended to use a mnemonic, set MNEMONIC instead."
    );
  }
  return "0x" + hex;
}

function getReadContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_STORE_ABI, provider);
}

function getWriteContract() {
  const provider = getProvider();
  const privateKey = process.env.PRIVATE_KEY;
  const mnemonic = process.env.MNEMONIC;

  let wallet;
  if (privateKey && privateKey.trim().length > 0) {
    const normalized = normalizePrivateKey(privateKey);
    wallet = new ethers.Wallet(normalized, provider);
  } else if (mnemonic && mnemonic.trim().length > 0) {
    wallet = ethers.Wallet.fromPhrase(mnemonic.trim()).connect(provider);
  } else {
    throw new Error("Provide PRIVATE_KEY (0x<64 hex>) or MNEMONIC for write operations");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_STORE_ABI, wallet);
}

async function main() {
  const [, , action, ...args] = process.argv;

  if (!action || ["help", "-h", "--help"].includes(action)) {
    console.log("Usage:");
    console.log("  Read number       : node scripts/simpleStore.js getNumber");
    console.log("  Read owner        : node scripts/simpleStore.js getOwner");
    console.log("  Set number (owner): PRIVATE_KEY=...|MNEMONIC=... SEPOLIA_RPC_URL=... node scripts/simpleStore.js setNumber <uint>");
    console.log("  Change owner      : PRIVATE_KEY=...|MNEMONIC=... SEPOLIA_RPC_URL=... node scripts/simpleStore.js changeOwner <address>");
    console.log("");
    console.log("Env vars:");
    console.log("  SEPOLIA_RPC_URL  (recommended) e.g. https://sepolia.infura.io/v3/<key> or Alchemy endpoint");
    console.log("  PRIVATE_KEY      (0x<64 hex>, write ops) - must be the contract owner");
    console.log("  MNEMONIC         (12/24 words, alternative to PRIVATE_KEY)");
    return;
  }

  switch (action) {
    case "getNumber": {
      const contract = getReadContract();
      const value = await contract.getNumber();
      console.log(`Stored number: ${value.toString()}`);
      break;
    }
    case "getOwner": {
      const contract = getReadContract();
      const owner = await contract.getOwner();
      console.log(`Owner: ${owner}`);
      break;
    }
    case "setNumber": {
      const [numArg] = args;
      if (numArg === undefined) {
        throw new Error("Missing <uint> argument. Example: setNumber 42");
      }
      // ethers v6 accepts bigint/string/number for uint256. Use bigint for safety.
      const num = BigInt(numArg);
      const contract = getWriteContract();
      const tx = await contract.setNumber(num);
      console.log(`setNumber tx sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`setNumber confirmed in block ${receipt.blockNumber}`);
      break;
    }
    case "changeOwner": {
      const [newOwner] = args;
      if (!newOwner) {
        throw new Error("Missing <address> argument. Example: changeOwner 0xabc...123");
      }
      const contract = getWriteContract();
      const tx = await contract.changeOwner(newOwner);
      console.log(`changeOwner tx sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`changeOwner confirmed in block ${receipt.blockNumber}`);
      break;
    }
    default:
      throw new Error(`Unknown action: ${action}. Run with 'help' for usage.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


