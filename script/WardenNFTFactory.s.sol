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
        vm.startBroadcast(privateKey);
        wardenNFTFactory = new WardenNFTFactory(mailbox, domain, target);
        vm.stopBroadcast();
        _saveDeployment();
    }

    function _saveDeployment() private {
        string memory path = _getDeploymentPath(DEPLOYMENT_FILE);
        string memory output = vm.serializeAddress("", "WardenNFTFactory", address(wardenNFTFactory));
        vm.writeJson(output, path);
    }

    function _getDeploymentPath(string memory deploymentName) internal view returns (string memory) {
        string memory root = vm.projectRoot();
        string memory chainDir = string.concat(vm.toString(block.chainid));
        string memory path = string.concat(root, "/script/deployment/", chainDir, "/", deploymentName);
        return path;
    }
}
