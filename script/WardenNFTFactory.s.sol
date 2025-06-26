// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {VmSafe} from "forge-std/Vm.sol";
import {WardenNFTFactory} from "../src/WardenNFTFactory.sol";

contract DeployFactory is Script {
    string public constant DEPLOYMENT_FILE = "factory.json";
    WardenNFTFactory public wardenNFTFactory;

    function run(address mailbox, uint32 domain, bytes32 target) public {
        console.log("mailbox: %s", mailbox);
        console.log("domain: %s", domain);
        console.logBytes32(target);

        uint256 privateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(privateKey);
        console.log("deployer address: %s", deployer);

        vm.startBroadcast(privateKey);
        wardenNFTFactory = new WardenNFTFactory(mailbox, domain, target);
        console.log("wardenNFTFactory: %s", address(wardenNFTFactory));
        vm.stopBroadcast();

        _saveDeployment();
    }

    function _saveDeployment() private {
        string memory path = _getOrCreateDeploymentPath(DEPLOYMENT_FILE);
        string memory output = vm.serializeAddress("", "WardenNFTFactory", address(wardenNFTFactory));
        vm.writeJson(output, path);
    }

    function _getOrCreateDeploymentPath(string memory deploymentName) internal returns (string memory) {
        string memory root = vm.projectRoot();
        string memory chainDir = string.concat(vm.toString(block.chainid));
        string memory dir = string.concat(root, "/script/deployment/", chainDir);
        if (!vm.exists(dir)) {
            vm.createDir(dir, true);
        }

        string memory path = string.concat(root, "/script/deployment/", chainDir, "/", deploymentName);
        return path;
    }
}
