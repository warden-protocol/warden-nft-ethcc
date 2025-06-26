// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.30;

interface IWardenRegistry {
    function mailbox() external view returns (address);

    function domain() external view returns (uint32);

    function target() external view returns (bytes32);

    function targetPlugin() external view returns (string memory);
}
