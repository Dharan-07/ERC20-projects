//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Batman{
    string private constant name = "Batman";
    string private constant symbol = "BTM";
    uint256 private constant decimals = 18;

    address private owner;
    uint256 private constant totalSupply = 10000000000 * (10 ** decimals);
    uint256 private initialSupply = totalSupply;
    uint256 private constant mint_amount = 5 * (10 ** decimals);

    uint256 private burnvalue;

    mapping(address => uint256) private balances;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(){
        owner = msg.sender;
        uint256 ownerFund = initialSupply / 10;
        balances[owner] = ownerFund;
        initialSupply -= ownerFund;
    }

    modifier onlyOwner(){
        require(msg.sender == owner,"only owner have access to this function");
        _;
    }

    function TotalToken() pure public returns(uint256){
        return totalSupply;
    }

    function balanceOf(address account) public view returns(uint256){
        return balances[account];
    }

    function transfer(address to, uint256 amount) public returns(bool success){
        uint256 amountwithdecimal = amount * (10 ** decimals);
        require(balances[msg.sender] >= amountwithdecimal, "Insufficient balance");
        balances[msg.sender] -= amountwithdecimal;
        uint256 valueaftertax = (amountwithdecimal * 3)/100;
        uint256 remainingvalue = amountwithdecimal - valueaftertax;
        balances[to] += remainingvalue;
        burnvalue  += valueaftertax;

        
        emit Transfer(msg.sender, to, remainingvalue);
        return true;
    }

    function mint() public returns (bool success){
        balances[msg.sender] += mint_amount;
        return true;
    }

    function burn() public onlyOwner() returns(bool success){
        burnvalue = 0;
    }
}