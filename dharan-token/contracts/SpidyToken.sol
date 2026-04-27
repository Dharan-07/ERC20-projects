// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";



contract DharanToken is ERC20Capped {

    address payable public owner;
    uint256 public blockReward;

    constructor(uint256 cap, uint256 reward) ERC20("Spidy", "SPY") ERC20Capped(cap * (10 ** decimals())) {
        owner = payable(msg.sender);
        _mint(owner, 70000000 * (10 ** decimals()) /*initial supply */);
        blockReward = reward * (10 ** decimals());
    }

    function _mintMinerRewrd() internal {
        _mint(block.coinbase, blockReward);
    }

    function _beforeTokenTransfer(address from, address to, uint256 value) internal {}

    function setBlockReward(uint256 reward) public onlyOwner {
        blockReward = reward * (10 ** decimals());

    }

    modifier onlyOwner{
        require(msg.sender == owner, "only owner can call this function");
        _;
    }
}
