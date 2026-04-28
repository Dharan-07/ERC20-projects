//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SpidyToken{
    string private constant _name = "Spidy";
    string private constant _symbol = "SPD";
    uint256 private constant _decimal = 18;

    address private owner;
    uint256 private _totalSupply;
    uint256 private _initialSupply;

    mapping(address => uint256) private balances;

    constructor(uint256 _totalTokenSupply){
        owner = msg.sender;
        _totalSupply = _totalTokenSupply * ( 10** _decimal);
        _initialSupply = _totalSupply / 10;
        balances[owner] = _initialSupply;
    }

    function name() public pure returns (string memory){
        return _name;
    }

    function symbol() public pure returns (string memory){
        return _symbol;
    }

    function decimal() public pure returns (uint256){
        return _decimal;
    }

    function totalSupply() public view returns(uint256){
        return _totalSupply;
    }

    function balanceOf(address account) public view returns(uint256){
        return balances[account];
    }
}