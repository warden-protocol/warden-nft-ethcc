// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.30;

/// @dev https://github.com/warden-protocol/wardenprotocol/blob/fe7ac966816eb71b415096ee93796b69d29efcf9/utils/dockerenv/contracts/callback.sol#L9
interface IMailbox {
    function dispatch(uint32 destinationDomain, bytes32 recipientAddress, bytes calldata messageBody)
        external
        payable
        returns (bytes32 messageId);

    function quoteDispatch(uint32 destinationDomain, bytes32 recipientAddress, bytes calldata messageBody)
        external
        view
        returns (uint256 fee);
}
