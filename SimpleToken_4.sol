// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name = "Simple Token";
    string public symbol = "SIMP";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    address public owner;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed burner, uint256 value);
    
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }
    
    function balanceOf_view(address _account) public view returns (uint256) {
        return balanceOf[_account];
    }
    
    function getAllowance(address _owner, address _spender) public view returns (uint256) {
        return allowance[_owner][_spender];
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Cannot transfer to zero address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Cannot approve zero address");
        
        allowance[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Cannot transfer to zero address");
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Allowance exceeded");
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    function increaseAllowance(address _spender, uint256 _addedValue) public returns (bool success) {
        require(_spender != address(0), "Cannot approve zero address");
        
        allowance[msg.sender][_spender] += _addedValue;
        
        emit Approval(msg.sender, _spender, allowance[msg.sender][_spender]);
        return true;
    }
    
    function decreaseAllowance(address _spender, uint256 _subtractedValue) public returns (bool success) {
        require(_spender != address(0), "Cannot approve zero address");
        require(_subtractedValue <= allowance[msg.sender][_spender], "Decreased allowance below zero");
        
        allowance[msg.sender][_spender] -= _subtractedValue;
        
        emit Approval(msg.sender, _spender, allowance[msg.sender][_spender]);
        return true;
    }
    
    function burn(uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance to burn");
        
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        
        emit Burn(msg.sender, _value);
        emit Transfer(msg.sender, address(0), _value);
        return true;
    }
    
    function mint(address _to, uint256 _value) public returns (bool success) {
        require(msg.sender == owner, "Only owner can mint");
        require(_to != address(0), "Cannot mint to zero address");
        
        balanceOf[_to] += _value;
        totalSupply += _value;
        
        emit Transfer(address(0), _to, _value);
        return true;
    }
}
