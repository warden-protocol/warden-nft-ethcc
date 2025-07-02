# Warden NFT

## Development

### Active Deployments
The currently deployed `WardenNFTFactory` address on the Sepolia testnet is [0x31b939ff53b83c57D4F5317A87121ed82d44E363](https://sepolia.etherscan.io/address/0x31b939ff53b83c57D4F5317A87121ed82d44E363).

### Requirements

[Foundry](https://getfoundry.sh/introduction/installation)

### Build

```shell
$ make build
```

### Test

```shell
$ make test
```

### Format

```shell
$ forge fmt
```

### Deploy

1. Set the `DEPLOYER_PRIVATE_KEY` environment variable.
2. Run:
    ```bash
    $ forge script script/WardenNFTFactory.s.sol:DeployFactory \
        --sig "run(address, uint32, bytes32, string calldata)" \
        <mailbox_contract_address> <domain> <destination_address> <plugin_name> \
        --rpc-url <your_rpc_url> \
        --broadcast
    ```

Example Warden default constructor values for Sepolia testnet:
- mailbox_contract_address: `0x2e7FAb47da4AeE0A8b8F8AAfFAB1Ca698F864bdf`
- domain: `141414`
- destination_address: `0x000000000000000000000000E5616e072FA070E4b9B4A1fab03849555496a6CA`
- plugin_name: `"pfp"`

### UI

You can use the built-in UI to interact with the Factory contract or with the collection (once deployed) by running `make serve` inside the `/ui` directory.

# Step by step guide

## Part 1: Setting Up Your Environment

### Step 1: Install MetaMask Wallet

1. Go to [metamask.io](https://metamask.io/)
2. Click "Download" and install the browser extension
3. Create a new wallet and **save your secret phrase safely**
4. Write down your wallet address (starts with 0x...)

### Step 2: Get Test Ethereum

1. In MetaMask, switch to "Sepolia test network"
    - Click the network dropdown at the top
    - Select "Sepolia test network"
2. Get some Sepolia ETH tokens from [sepoliafaucet.com](https://sepoliafaucet.com/) or https://cloud.google.com/application/web3/faucet/ethereum/sepolia
3. Enter your wallet address and request test ETH
4. Wait 1-2 minutes for the ETH to appear in your wallet

### Step 3: Open Remix IDE

1. Go to [remix.ethereum.org](https://remix.ethereum.org/)
2. This is where we'll import and deploy our smart contract
3. Close any popup tutorials (they’re annoying).

---

## Part 2: Creating Your Smart Contract

### Step 4: Import the Smart Contract Code into Remix

1. In Remix, you need to click on the Workspace Actions menu button in the top left corner (near **WORKSPACES)**, then select “Clone” (look for the Github logo).
2. Paste the URL of the Github repository — [`https://github.com/warden-protocol/warden-nft-ethcc`](https://github.com/warden-protocol/warden-nft-ethcc) — into the input field and click OK.
3. You can now browse the files related to this project.

---

## Part 3: Compiling and Deploying Your Smart Contract

### Step 5: Compile Your Contract

1. Click the "Solidity Compiler" tab (on the left side, it looks like Solidity logo)
2. Make sure compiler version is "0.8.29" or higher
3. Click "Compile WardenNFTFactory.sol"
4. Wait for green checkmark (means success!) on the Solidity icon

### Step 6: Deploy to Blockchain

1. Click "Deploy & Run Transactions" tab (looks like Ethereum logo)
2. In "Environment" dropdown, select "Injected Provider - MetaMask"
3. MetaMask will popup - click "Connect"
4. Skip a few options and select “WardenNFTFactory" in the CONTRACT dropdown
5. Click the little arrow to the right of the "Deploy" (orange) button to expand the parameter list
    1. mailbox_: `0x2e7FAb47da4AeE0A8b8F8AAfFAB1Ca698F864bdf`
    2. domain_: `141414`
    3. target_: `0x000000000000000000000000E5616e072FA070E4b9B4A1fab03849555496a6CA`
    4. targetPlugin_: `pfp`
6. Click the orange “**transact**” button and MetaMask will popup - click "Confirm" to pay gas fees
7. Wait for confirmation (you'll see your contract address below in the terminal output) and your NFT factory contract will appear under “Deployed Contracts on the left side”

### Step 9: Save Important Information

Write down these addresses:

- **Your Wallet Address**: (from MetaMask)
- **Your Contract Address**: (from Remix, after deployment)

---

## Part 4: Interacting with Your NFT Contract

### Step 10: Deploy Your First NFT collection from the NFT factory

1. In Remix, scroll down to "**Deployed Contracts**"
2. Click the dropdown arrow next to your contract
3. Find the "**createCollection**" function (disabled orange button) and click the arrow next to it
4. In the first text box type: `"My First Workshop NFT"` and then use your initials for the symbol: `ABC`
5. Click "**transact**" (orange button)
6. Confirm the transaction in MetaMask
7. You have just created your first NFT collection that allows you to mint NFTs! To view and interact with it, click on “view on Etherscan” link in the terminal output window. Once there, wait for the transaction to be confirmed by the network — keep refreshing the page until you eventually see something like `[[0x9e8572b41514a12f49aa8fc0b862437e32326f67](https://sepolia.etherscan.io/address/0x9e8572b41514a12f49aa8fc0b862437e32326f67) Created]` under the “To:” field.

### Step 11: Mint Your NFT

1. While still on Etherscan, click on the newly created contract (from the previous step), then click on the Contract tab and then finally click on the “**Write Contract**” button
2. You need to connect your MetaMask wallet at this point. There’s a button right below the you just clicked, called “**Connect to Web3**” (select MetaMask from the list).
3. Click on function `2. createNFT` to expand it. Here you need to provide the `nftDescription` which is the AI prompt that will be used by the [Venice.ai](http://Venice.ai) model to generate you PFP. Check the next step to see you can get an estimation of how much you need to pay to mint the NFT.
4. Click the “**Read Contract**” button above the functions, then connect your MetaMask account like in the previous step. Now scrolls down to function `8. quoteDispatch`. Paste the same AI prompt as above then click the “**Query**” button to obtain your quote. You should see something below that looks like **`fee** *uint256***:** 3500688447` . That’s the amount of gas you need to pay to mint your NFT.
5. Copy the fee amount and add `0.00000000` before it (that is 8 zeros). You should have something like `0.000000003500688447` total ETH.
6. Go back to the “**Write Contract**” tab and use the value you obtained in the previous step in the `payableAmount` field, next to your `nftDescription`. Click “**Write**” to mint your NFT!
7. We’re almost there. If you go back to “**Read Contract**” you can check if you NFT was minted by clicking on function `5. nftCount`. Then the NFT is minted, it should increase from 0 to 1.

---

## Part 5: Viewing Your NFTs

### Step 13: Add NFT to MetaMask

1. Open MetaMask
2. Click "NFTs" tab
3. Click "Import NFT"
4. Enter your contract address, the one for your NFT collection you deployed at the end of Step 10 (e.g., [`0x9e8572b41514a12f49aa8fc0b862437e32326f67`](https://sepolia.etherscan.io/address/0x9e8572b41514a12f49aa8fc0b862437e32326f67))
5. Enter token ID (your first NFT will always have ID 0), so you put 0.
6. Click "Add"

### Step 14: View on OpenSea (Testnet)

1. Go to [testnets.opensea.io](https://testnets.opensea.io/)
2. Connect your MetaMask wallet (Login)
3. See all your NFTs!
