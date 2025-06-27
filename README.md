# Warden NFT

## User Flow
1. Open an existing `WardenNFTFactory` (see [Deployments](#deployments)) or deploy your own (see [Deploy](#deploy)).
2. Create your own collection by calling the `createCollection` method with your desired name and symbol.
3. Retrieve your collection using the `collections` method by passing your wallet address.
4. Call the `createNFT` method and provide a prompt for the AI.
5. After successful execution, a new NFT will be minted to your address, and the `nftCount` value will be incremented.

## Deployments
The currently deployed `WardenNFTFactory` address on the Sepolia testnet is [0x31b939ff53b83c57D4F5317A87121ed82d44E363](https://sepolia.etherscan.io/address/0x31b939ff53b83c57D4F5317A87121ed82d44E363).

## Development

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