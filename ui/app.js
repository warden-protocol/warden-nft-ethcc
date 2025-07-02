import {
  connectWallet,
  getFactoryContract,
  deployCollection,
  validateExistingCollection,
  validateFactoryContract,
  mintNFT,
  FACTORY_ABI,
  FACTORY_BYTECODE,
  NFT_ABI
} from './wardenContracts.js';

// --- UI Elements ---
const connectBtn = document.getElementById('connectWallet');
const connectFactoryBtn = document.getElementById('connectFactoryBtn');
const factoryAddressInput = document.getElementById('factoryAddressInput');
const factoryStatus = document.getElementById('factoryStatus');
const collectionSection = document.getElementById('collectionSection');
const mintSection = document.getElementById('mintSection');
const collectionAddressInput = document.getElementById('collectionAddress');
const mintCollectionInput = document.getElementById('mintCollection');
const mintDescInput = document.getElementById('mintDesc');
const mintResultDiv = document.getElementById('mintResult');
const createCollectionBtn = document.getElementById('createCollection');
const mintNFTBtn = document.getElementById('mintNFT');
const step1Status = document.getElementById('step1-status');
const connectWalletDiv = document.getElementById('connectWallet');
const walletConnectedDiv = document.getElementById('walletConnected');
const userAddressDiv = document.getElementById('userAddress');
const step2Status = document.getElementById('step2-status');
const step3Status = document.getElementById('step3-status');
const step4Status = document.getElementById('step4-status');
const collectionInfoDiv = document.getElementById('collectionInfo');
const collectionDetailsDiv = document.getElementById('collectionDetails');
const existingCollectionInput = document.getElementById('existingCollectionAddress');
const collectionContractAddressInput = document.getElementById('collectionContractAddressInput');

let provider, signer, userAddress, factoryAddress, factoryContract;
let currentMintingFee = null;

function showStatus(element, message, type = 'error') {
  if (!element) return;
  element.innerHTML = `<div class="status-message ${type}">${message}</div>`;
}

// --- Wallet Connection ---
connectBtn.addEventListener('click', async () => {
  try {
    const { provider: prov, signer: sign, userAddress: addr } = await connectWallet();
    provider = prov;
    signer = sign;
    userAddress = addr;
    userAddressDiv.innerText = userAddress;
    connectWalletDiv.classList.add('hidden');
    walletConnectedDiv.classList.remove('hidden');
    showStatus(step1Status, 'Wallet connected!', 'success');
    enableStep(2);
  } catch (e) {
    showStatus(step1Status, e.message || 'Failed to connect wallet', 'error');
  }
});

function enableStep(stepNumber) {
  const step = document.getElementById(`step${stepNumber}`);
  if (step) {
    step.classList.remove('disabled');
    step.classList.add('active');
    // Enable specific buttons
    if (stepNumber === 2) {
      const btn = document.getElementById('connectFactory');
      if (btn) btn.disabled = false;
    } else if (stepNumber === 3) {
      const btn = document.getElementById('createCollection');
      if (btn) btn.disabled = false;
    } else if (stepNumber === 4) {
      const btn = document.getElementById('mintNFT');
      if (btn) btn.disabled = false;
    }
  }
}

// Add function to skip factory connection when using existing collection
function skipToStep3() {
  // Mark step 2 as completed without actually connecting to factory
  const step2 = document.getElementById('step2');
  const step2Number = document.getElementById('step2-number');
  if (step2) {
    step2.classList.remove('active');
    step2.classList.add('completed');
  }
  if (step2Number) {
    step2Number.classList.add('completed');
    step2Number.textContent = '✓';
  }
  enableStep(3);
}

// Update the existing collection input handler in the HTML script
document.addEventListener('DOMContentLoaded', function() {
  const existingCollectionInput = document.getElementById('existingCollectionAddress');
  const createCollectionForm = document.getElementById('createCollectionForm');
  
  function toggleFormVisibility() {
    if (existingCollectionInput.value.trim()) {
      createCollectionForm.style.display = 'none';
      // If user enters existing collection, skip factory connection
      if (document.getElementById('step2').classList.contains('active')) {
        skipToStep3();
      }
    } else {
      createCollectionForm.style.display = 'block';
      // If user clears existing collection, require factory connection
      if (!factoryContract) {
        const step2 = document.getElementById('step2');
        const step2Number = document.getElementById('step2-number');
        if (step2) {
          step2.classList.remove('completed');
          step2.classList.add('active');
        }
        if (step2Number) {
          step2Number.classList.remove('completed');
          step2Number.textContent = '2';
        }
        // Disable step 3 if no factory is connected
        const step3 = document.getElementById('step3');
        if (step3) {
          step3.classList.remove('active');
          step3.classList.add('disabled');
        }
      }
    }
  }
  
  existingCollectionInput.addEventListener('input', toggleFormVisibility);
  toggleFormVisibility(); // Initial state
});

// Hide collection and mint sections initially
if (collectionSection) collectionSection.style.display = 'none';
if (mintSection) mintSection.style.display = 'none';

// --- Step 2: Factory and Collection Connection ---

if (factoryForm) {
  factoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const addr = factoryAddressInput.value.trim();
    if (!addr) {
      showStatus(step2Status, 'Please enter a factory address.', 'error');
      return;
    }
    try {
      factoryContract = await validateFactoryContract(addr, provider, signer);
      showStatus(step2Status, 'Factory connected!', 'success');
      enableStep(3);
    } catch (e) {
      showStatus(step2Status, e.message || 'Failed to connect factory', 'error');
    }
  });
}

if (collectionForm) {
  collectionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!collectionContractAddressInput) {
      showStatus(step2Status, 'Collection contract address input not found.', 'error');
      return;
    }
    const addr = collectionContractAddressInput.value.trim();
    if (!addr) {
      showStatus(step2Status, 'Please enter a collection contract address.', 'error');
      return;
    }
    try {
      const nft = await validateExistingCollection(addr, provider, signer, userAddress);
      showStatus(step2Status, 'Collection connected: ' + addr, 'success');
      collectionAddressInput.value = addr;
      collectionInfoDiv.classList.remove('hidden');
      document.getElementById('collectionAddress').innerText = addr;
      // Hide Step 3 and go directly to Step 4
      const step3 = document.getElementById('step3');
      if (step3) step3.style.display = 'none';
      enableStep(4);
    } catch (e) {
      showStatus(step2Status, e.message || 'Failed to connect collection', 'error');
    }
  });
}

// Show Step 3 again if collection address is cleared
if (collectionContractAddressInput) {
  collectionContractAddressInput.addEventListener('input', () => {
    const step3 = document.getElementById('step3');
    if (collectionContractAddressInput.value.trim() === '') {
      if (step3) step3.style.display = '';
    }
  });
}

// --- Collection Creation ---
createCollectionBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const existingAddr = existingCollectionInput.value.trim();
  if (existingAddr) {
    try {
      const nft = await validateExistingCollection(existingAddr, provider, signer, userAddress);
      showStatus(step3Status, 'Using existing collection: ' + existingAddr, 'success');
      collectionDetailsDiv.innerText = 'Existing Collection';
      collectionAddressInput.value = existingAddr;
      collectionInfoDiv.classList.remove('hidden');
      document.getElementById('collectionAddress').innerText = existingAddr;
      enableStep(4);
    } catch (e) {
      showStatus(step3Status, e.message || 'Failed to validate collection', 'error');
    }
  } else {
    const name = document.getElementById('collectionName').value;
    const symbol = document.getElementById('collectionSymbol').value;
    if (!name || !symbol) {
      showStatus(step3Status, 'Please enter both collection name and symbol.', 'error');
      return;
    }
    showStatus(step3Status, 'Creating collection (may take a moment)...', 'info');
    try {
      const collectionAddr = await deployCollection(factoryContract, name, symbol);
      if (collectionAddr && collectionAddr !== '0x0000000000000000000000000000000000000000') {
        showStatus(step3Status, 'Collection created at: ' + collectionAddr, 'success');
        collectionDetailsDiv.innerText = name + ' (' + symbol + ')';
        collectionAddressInput.value = collectionAddr;
        collectionInfoDiv.classList.remove('hidden');
        document.getElementById('collectionAddress').innerText = collectionAddr;
        enableStep(4);
      } else {
        showStatus(step3Status, 'Collection created, but address not found.', 'error');
      }
    } catch (e) {
      showStatus(step3Status, e.message || 'Collection creation failed', 'error');
    }
  }
});

// --- Mint NFT ---
mintNFTBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  let collectionAddr = (existingCollectionInput && existingCollectionInput.value.trim())
    ? existingCollectionInput.value.trim()
    : (document.getElementById('collectionAddress').innerText || collectionAddressInput.value);
  if (!collectionAddr || collectionAddr === '') {
    showStatus(step4Status, 'No collection address available. Please complete Step 3 first.', 'error');
    return;
  }
  const desc = mintDescInput.value;
  if (!desc) {
    showStatus(step4Status, 'Please enter an AI prompt/description.', 'error');
    return;
  }
  showStatus(step4Status, 'Estimating minting fee...', 'info');
  try {
    const nft = await validateExistingCollection(collectionAddr, provider, signer, userAddress);
    const fee = await mintNFT(nft, desc);
    const feeEth = ethers.formatEther(fee);
    showStatus(step4Status, `NFT minted! Fee paid: ${feeEth} ETH`, 'success');
  } catch (e) {
    showStatus(step4Status, e.message || 'Mint failed', 'error');
  }
});

// Helper to mark a step as completed/disabled
function completeStep(stepNumber) {
  const step = document.getElementById(`step${stepNumber}`);
  if (step) {
    step.classList.remove('active');
    step.classList.add('completed');
    step.classList.add('disabled');
    // Disable all inputs/buttons in this step
    const inputs = step.querySelectorAll('input,button');
    inputs.forEach(i => i.disabled = true);
  }
}
function uncompleteStep(stepNumber) {
  const step = document.getElementById(`step${stepNumber}`);
  if (step) {
    step.classList.remove('completed');
    step.classList.remove('disabled');
    // Enable all inputs/buttons in this step
    const inputs = step.querySelectorAll('input,button');
    inputs.forEach(i => i.disabled = false);
  }
}

// Watch for changes in the existing collection address input
if (existingCollectionInput) {
  existingCollectionInput.addEventListener('input', async (e) => {
    const val = existingCollectionInput.value.trim();
    if (val && ethers.isAddress(val)) {
      // Disable Step 2
      completeStep(2);
      // Enable Step 3
      enableStep(3);
    } else {
      // Re-enable Step 2
      uncompleteStep(2);
      // Only enable Step 3 if Step 2 is completed (factory connected)
      const step2 = document.getElementById('step2');
      if (step2 && step2.classList.contains('completed')) {
        enableStep(3);
      } else {
        // Otherwise, disable Step 3
        const step3 = document.getElementById('step3');
        if (step3) {
          step3.classList.add('disabled');
          step3.classList.remove('active');
        }
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  // Place all of app.js logic here, indented one level
}); 