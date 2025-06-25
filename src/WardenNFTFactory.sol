// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.30;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";

import {WardenNFT} from "./WardenNFT.sol";
import {IWardenRegistry} from "./interfaces/IWardenRegistry.sol";

contract WardenNFTFactory is Ownable2Step, IWardenRegistry {
    address public mailbox;
    uint32 public domain;
    bytes32 public target;
    mapping(address user => address) public collections;

    event NewCollectionCreated(address indexed owner, address indexed collection);
    event MailboxChanged(address newMailbox);
    event DomainChanged(uint32 newDomain);
    event TargetChanged(bytes32 newTarget);

    error AlreadyOwnsCollection(address collection);

    constructor(address mailbox_, uint32 domain_, bytes32 target_) Ownable(msg.sender) {
        mailbox = mailbox_;
        domain = domain_;
        target = target_;
    }

    function createCollection(string calldata name, string calldata symbol) external returns (address collection) {
        if (collections[msg.sender] != address(0)) revert AlreadyOwnsCollection(collections[msg.sender]);

        collection = address(new WardenNFT(msg.sender, name, symbol));
        collections[msg.sender] = collection;

        emit NewCollectionCreated(msg.sender, collection);
    }

    function changeMailbox(address newMailbox) external onlyOwner {
        mailbox = newMailbox;
        emit MailboxChanged(newMailbox);
    }

    function changeDomain(uint32 newDomain) external onlyOwner {
        domain = newDomain;
        emit DomainChanged(newDomain);
    }

    function changeTarget(bytes32 newTarget) external onlyOwner {
        target = newTarget;
        emit TargetChanged(newTarget);
    }
}
