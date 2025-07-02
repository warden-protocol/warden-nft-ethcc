// wardenContracts.js
// All smart contract logic for Warden NFT UI

// --- Constants ---
export const FACTORY_ABI = [
  {"inputs":[{"internalType":"address","name":"mailbox_","type":"address"},{"internalType":"uint32","name":"domain_","type":"uint32"},{"internalType":"bytes32","name":"target_","type":"bytes32"},{"internalType":"string","name":"targetPlugin_","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"collection","type":"address"}],"type":"error","name":"AlreadyOwnsCollection"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"type":"error","name":"OwnableInvalidOwner"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"type":"error","name":"OwnableUnauthorizedAccount"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint32","name":"newDomain","type":"uint32"}],"name":"DomainChanged","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newMailbox","type":"address"}],"name":"MailboxChanged","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"collection","type":"address"}],"name":"NewCollectionCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"newTarget","type":"bytes32"}],"name":"TargetChanged","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"newTargetPlugin","type":"string"}],"name":"TargetPluginChanged","type":"event"},
  {"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint32","name":"newDomain","type":"uint32"}],"name":"changeDomain","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newMailbox","type":"address"}],"name":"changeMailbox","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"bytes32","name":"newTarget","type":"bytes32"}],"name":"changeTarget","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"string","name":"newTargetPlugin","type":"string"}],"name":"changeTargetPlugin","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"collections","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"}],"name":"createCollection","outputs":[{"internalType":"address","name":"collection","type":"address"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"domain","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"mailbox","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"target","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"targetPlugin","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}
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
  if (!code.includes('43add2e6')) {
    throw new Error('This contract does not appear to be a WardenNFTFactory (missing collections(address) function).');
  }
  return new ethers.Contract(addr, FACTORY_ABI, signer);
}

// --- Connect to Existing Factory Contract ---
/**
 * Connects to an existing WardenNFTFactory contract after validating the address and contract code.
 * @param {string} addr - The factory contract address
 * @param {ethers.Provider} provider - The ethers provider
 * @param {ethers.Signer} signer - The ethers signer
 * @returns {ethers.Contract} - The connected factory contract instance
 * @throws {Error} - If the address is invalid or not a WardenNFTFactory
 */
export async function connectToFactory(addr, provider, signer) {
  if (!ethers.isAddress(addr) || addr === ethers.ZeroAddress) throw new Error("Invalid factory contract address format");
  const code = await provider.getCode(addr);
  if (code === '0x') throw new Error("No contract found at this address");
  const contract = new ethers.Contract(addr, FACTORY_ABI, signer);
  try {
    // Try calling a factory-specific function with a dummy address
    await contract.collections(ethers.ZeroAddress);
  } catch (err) {
    throw new Error('This contract does not appear to be a WardenNFTFactory (collections(address) call failed).');
  }
  return contract;
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
  const tx = await nft.createNFT(desc, { value: fee });
  await tx.wait();
  return fee;
} 