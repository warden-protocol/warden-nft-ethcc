// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.30;

/// @dev https://github.com/warden-protocol/wardenprotocol/blob/fe7ac966816eb71b415096ee93796b69d29efcf9/utils/dockerenv/contracts/callback.sol#L43
interface IOrigin {
    function handle(uint32, bytes32 sender, bytes calldata message) external payable;
}
