// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {
    ERC1155Burnable
} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract MyToken is ERC1155, Ownable, ERC1155Burnable {
    string private constant METADATA_CID =
        "bafybeicqdj2ixsjpdaqcwoxpnsxkerpphyo2kathpqzbbflqs4qeiesgze";

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    function uri(uint256 id) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "https://lavender-near-wolf-6.mypinata.cloud/ipfs/",
                    METADATA_CID,
                    "/",
                    Strings.toString(id),
                    ".json"
                )
            );
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
}
