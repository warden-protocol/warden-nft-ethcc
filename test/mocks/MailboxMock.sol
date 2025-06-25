// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";

import {IMailbox} from "../../src/interfaces/IMailbox.sol";

contract MailboxMock is IMailbox {
    event Dispatched(uint32 destinationDomain, bytes32 recipientAddress, bytes messageBody);

    function dispatch(uint32 destinationDomain, bytes32 recipientAddress, bytes calldata messageBody)
        external
        payable
        override
        returns (bytes32 messageId)
    {
        emit Dispatched(destinationDomain, recipientAddress, messageBody);
        return 0;
    }

    function quoteDispatch(uint32, bytes32, bytes calldata) external pure override returns (uint256) {
        revert("Not implemented");
    }
}
