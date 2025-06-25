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

    function _dispatch(bytes memory messageBody) internal returns (bytes32 messageId) {
        (IMailbox mailbox, uint32 domain, bytes32 target) = _getRegistryData();
        return mailbox.dispatch(domain, target, messageBody);
    }

    function _quoteDispatch(bytes memory messageBody) internal view returns (uint256 fee) {
        (IMailbox mailbox, uint32 domain, bytes32 target) = _getRegistryData();
        return mailbox.quoteDispatch(domain, target, messageBody);
    }

    function _getRegistryData() private view returns (IMailbox mailbox, uint32 domain, bytes32 target) {
        mailbox = IMailbox(registry.mailbox());
        domain = registry.domain();
        target = registry.target();
    }

    function _allowedSender(uint32 domain, bytes32 sender) private view {
        (IMailbox mailbox, uint32 domain_, bytes32 target) = _getRegistryData();
        if (msg.sender != address(mailbox) || sender != target || domain == domain_) revert NoAccess();
    }
}
