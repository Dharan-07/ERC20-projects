// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CyberDragon
 * @dev Basic ERC721 implementation for the Cyber Dragon NFT Collection.
 */
contract CyberDragon is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event NFTMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor()
        ERC721("Cyber Dragon", "CDRGN")
        Ownable(msg.sender)
    {}

    /**
     * @notice Mints a new NFT to the specified recipient.
     * @param recipient The address that will own the minted NFT.
     * @param tokenURI The metadata URI (e.g., ipfs://...) for the token.
     * @return The unique ID of the newly minted NFT.
     */
    function mintNFT(address recipient, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(recipient, tokenId, tokenURI);

        return tokenId;
    }
}