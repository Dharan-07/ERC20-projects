// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract usdt is ERC20, Ownable {
    constructor(address initialOwner) ERC20("USDT", "USDT") Ownable(initialOwner) {
        uint256 initialSupply = 10_000_000 * 10 ** decimals();
        _mint(initialOwner, initialSupply);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
