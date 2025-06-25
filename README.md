# Warden NFT

## Usage

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

1. Set `DEPLOYER_PRIVATE_KEY` env variable
2. Run
    ```bash
    $ forge script script/WardenNFTFactory.s.sol:DeployFactory \
    --sig "run(address, uint32, bytes32)" <mailbox_contract_address> <domain> <destination_address> \
    --rpc-url <your_rpc_url> \
    --broadcast
    ```
