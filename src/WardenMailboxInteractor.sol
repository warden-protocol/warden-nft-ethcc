// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.30;

import {IOrigin} from "./interfaces/IOrigin.sol";
import {IMailbox} from "./interfaces/IMailbox.sol";
import {IWardenRegistry} from "./interfaces/IWardenRegistry.sol";

abstract contract WardenMailboxInteractor is IOrigin {
    IWardenRegistry public immutable registry;

    error NoAccess();

    modifier allowedSender(uint32 domain, bytes32 sender) {
        _allowedSender(domain, sender);
        _;
    }

    constructor(address registry_) {
        registry = IWardenRegistry(registry_);
    }

    function quoteDispatch(string memory nftDescription) public view returns (uint256 fee) {
        (IMailbox mailbox, uint32 domain, bytes32 target, string memory targetPlugin) = _getRegistryData();
        return mailbox.quoteDispatch(domain, target, _constructMessage(targetPlugin, nftDescription));
    }

    function _dispatch(string memory nftDescription) internal returns (bytes32 messageId) {
        (IMailbox mailbox, uint32 domain, bytes32 target, string memory targetPlugin) = _getRegistryData();
        return mailbox.dispatch{value: msg.value}(domain, target, _constructMessage(targetPlugin, nftDescription));
    }

    function _decodeResponse(bytes calldata response) internal pure returns (string memory nftMetadataUri) {
        (nftMetadataUri,) = abi.decode(response, (string, uint64));
    }

    function _getRegistryData()
        private
        view
        returns (IMailbox mailbox, uint32 domain, bytes32 target, string memory targetPlugin)
    {
        mailbox = IMailbox(registry.mailbox());
        domain = registry.domain();
        target = registry.target();
        targetPlugin = registry.targetPlugin();
    }

    function _allowedSender(uint32 domain, bytes32 sender) private view {
        (IMailbox mailbox, uint32 domain_, bytes32 target,) = _getRegistryData();
        if (msg.sender != address(mailbox) || sender != target || domain != domain_) revert NoAccess();
    }

    function _constructMessage(string memory targetPlugin, string memory nftDescription)
        private
        pure
        returns (bytes memory)
    {
        return abi.encode(targetPlugin, nftDescription);
    }
}
