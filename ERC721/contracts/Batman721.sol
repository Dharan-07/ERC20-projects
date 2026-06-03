// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Batman is
    ERC721,
    ERC721Enumerable,
    ERC721Pausable,
    Ownable,
    ERC721Burnable
{
    using Strings for uint256;

    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("Batman", "BAT")
        Ownable(initialOwner)
    {}

    function _baseURI()
        internal
        pure
        override
        returns (string memory)
    {
        return
            "https://lavender-near-wolf-6.mypinata.cloud/ipfs/bafybeidvyjx2xvkgg6mvgwcviuo6qbxqihknuy3rehjeknv6bg7b5jdmy4/";
    }

    function pause()
        public
        onlyOwner
    {
        _pause();
    }

    function unpause()
        public
        onlyOwner
    {
        _unpause();
    }

    function safeMint(
        address to
    )
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId;

        _nextTokenId++;

        _safeMint(to, tokenId);

        return tokenId;
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);

        return string.concat(
            _baseURI(),
            tokenId.toString(),
            ".json"
        );
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(
            ERC721,
            ERC721Enumerable,
            ERC721Pausable
        )
        returns (address)
    {
        return super._update(
            to,
            tokenId,
            auth
        );
    }

    function _increaseBalance(
        address account,
        uint128 value
    )
        internal
        override(
            ERC721,
            ERC721Enumerable
        )
    {
        super._increaseBalance(
            account,
            value
        );
    }
*   
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721,
            ERC721Enumerable
        )
        returns (bool)
    {
        return super.supportsInterface(
            interfaceId
        );
    }
}