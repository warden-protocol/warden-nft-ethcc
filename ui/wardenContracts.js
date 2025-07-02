// wardenContracts.js
// All smart contract logic for Warden NFT UI

// --- Constants ---
export const FACTORY_ABI = [
  // ... (copy ABI from app.js)
];
export const FACTORY_BYTECODE = "0x..."; // (copy from app.js)
export const NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
  "function createNFT(string nftDescription) external payable",
  "function quoteDispatch(string nftDescription) external view returns (uint256)",
  "function nftCount() external view returns (uint256)"
];

// --- Wallet Connection ---
export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer, userAddress: accounts[0] };
}

// --- Factory Contract ---
export function getFactoryContract(address, signer) {
  return new ethers.Contract(address, FACTORY_ABI, signer);
}

// --- Validate Factory Contract ---
export async function validateFactoryContract(addr, provider, signer) {
  if (!ethers.isAddress(addr) || addr === ethers.ZeroAddress) throw new Error("Invalid factory contract address format");
  const code = await provider.getCode(addr);
  if (code === '0x') throw new Error("No contract found at this address");
  // Check for the collections(address) function (selector: 0x5c975abb)
  if (!code.includes('5c975abb')) {
    throw new Error('This contract does not appear to be a WardenNFTFactory (missing collections(address) function).');
  }
  return new ethers.Contract(addr, FACTORY_ABI, signer);
}

// --- Deploy Collection ---
export async function deployCollection(factoryContract, name, symbol) {
  const tx = await factoryContract.createCollection(name, symbol);
  const receipt = await tx.wait();
  // Parse event for collection address
  const eventTopic = ethers.id("NewCollectionCreated(address,address)");
  let collectionAddr = null;
  for (const log of receipt.logs) {
    if (log.topics[0] === eventTopic && log.address.toLowerCase() === factoryContract.target.toLowerCase()) {
      try {
        const parsed = factoryContract.interface.parseLog(log);
        collectionAddr = parsed.args.collection;
        break;
      } catch {}
    }
  }
  // Fallback: call collections(userAddress)
  if (!collectionAddr) {
    const userAddress = await factoryContract.signer.getAddress();
    collectionAddr = await factoryContract.collections(userAddress);
  }
  return collectionAddr;
}

// --- Validate Existing Collection ---
export async function validateExistingCollection(addr, provider, signer, userAddress) {
  if (!ethers.isAddress(addr) || addr === ethers.ZeroAddress) throw new Error("Invalid collection address format");
  const code = await provider.getCode(addr);
  if (code === '0x') throw new Error("No contract found at this address");
  const nft = new ethers.Contract(addr, NFT_ABI, signer);
  try {
    await nft.name();
    await nft.symbol();
  } catch (err) {
    console.error('validateExistingCollection: error calling name/symbol:', err);
    throw new Error('This contract does not implement ERC721Metadata (name/symbol). Please provide a valid NFT collection contract address.');
  }
  const owner = await nft.owner();
  if (owner.toLowerCase() !== userAddress.toLowerCase()) {
    throw new Error(`You don't own this collection. The owner is: ${owner}`);
  }
  return nft;
}

// --- Mint NFT ---
export async function mintNFT(nft, desc) {
  let fee;
  try {
    fee = await nft.quoteDispatch(desc);
  } catch (err) {
    console.error('mintNFT: error calling quoteDispatch:', err);
    throw new Error('Failed to get minting fee from quoteDispatch. See console for details.');
  }
  console.log('mintNFT: calling createNFT with desc:', desc, 'and value:', fee.toString());
  const tx = await nft.createNFT(desc, { value: fee });
  await tx.wait();
  return fee;
} 