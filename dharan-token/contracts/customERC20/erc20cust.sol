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

    mapping(address => uint256) private balances;

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

    function balanceOf(address account) public view returns(uint256){
        return balances[account];
    }

    function transfer(address to, uint256 amount) public returns(bool success){
        uint256 amountwithdecimal = amount * (10 ** decimals);
        balanceOf[msg.sender] -= amountwithdecimal;
        balanceOf[]
    }

    function mint() public returns (bool success){
        balances[msg.sender] += mint_amount;
        return true;
    }
}