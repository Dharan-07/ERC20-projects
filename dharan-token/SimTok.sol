// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SimTok{
    string public name = "SimTok";
    string public symbol = "STK";
    uint256 public decimal = 18;

    uint256 public initialSupply;
    uint256 public totalSupply = 10000000 * 10 ** 18;

    address public owner;

    mapping(address => uint256) private balanceOf;

    constructor(){
        owner = msg.sender;
        initialSupply = totalSupply / 10 ;
        balanceOf[msg.sender] = totalSupply;
    }

    function balance_view (address _account) public view returns(uint256){
        return balanceOf[_account];
    }
}