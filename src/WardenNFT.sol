// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.30;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {WardenMailboxInteractor} from "./WardenMailboxInteractor.sol";

contract WardenNFT is ERC721URIStorage, Ownable, WardenMailboxInteractor {
    uint256 public nftCount;

    event NFTRequested();

    constructor(address initialOwner, string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        Ownable(initialOwner)
        WardenMailboxInteractor(msg.sender)
    {}

    function createNFT(bytes calldata nftDescription) external payable onlyOwner {
        _dispatch(nftDescription);
        emit NFTRequested();
    }

    function handle(uint32 domain, bytes32 sender, bytes calldata message)
        external
        payable
        allowedSender(domain, sender)
    {
        uint256 tokenId = nftCount++;
        _safeMint(owner(), tokenId);
        _setTokenURI(tokenId, string(message));
    }
}
