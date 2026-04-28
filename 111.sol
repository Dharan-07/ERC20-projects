//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SpidyToken {
    string private constant _name = "Spidy";
    string private constant _symbol = "SPD";
    uint8 private constant _decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    address private owner;

    constructor(uint256 _initialSupply) {
        owner = msg.sender;

        uint256 supply = _initialSupply * (10 ** _decimals);
        totalSupply = supply;
        balances[msg.sender] = supply;
    }

    function name() public pure returns (string memory){
        return _name;
    }

    function symbol() public pure returns (string memory){
        return _symbol;
    }

    function decimals() public pure returns (uint8){
        return _decimals;
    }
}