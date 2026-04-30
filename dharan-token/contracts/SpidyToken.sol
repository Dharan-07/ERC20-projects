//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract SpidyToken{
    
    string private constant _name = "Spidy";
    string private constant _symbol = "SPD";
    uint8 private constant _decimals = 18;

    address private owner;
    uint256 private immutable _totalSupply;
    uint256 private _initialSupply;
    uint256 private _mintedSupply;

    uint256 private constant Mint_Amount = 10 * (10 ** _decimals);
    uint256 private constant Mint_Limit = 100 * (10 ** _decimals);

    event Transfer(address indexed from,address indexed to,uint256 value);
    event Approval(address indexed owner,address indexed spender, uint256 value);
    event Mint(address indexed to,uint256 value);

    mapping(address => uint256) private balanceOf;
    mapping(address => mapping(address => uint256)) private _allowance;
    mapping(address => uint256) private _mintedByUser;

    constructor(uint256 _totalTokenSupply){
        owner = msg.sender;
        _totalSupply = _totalTokenSupply * ( 10** _decimals);
        _initialSupply = _totalSupply / 10;
        balanceOf[owner] = _initialSupply;
        _mintedSupply = _initialSupply;

        emit Transfer(address(0), owner, _initialSupply);
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

    function totalSupply() public view returns(uint256){
        return _totalSupply;
    }

    function balanceOf_view (address account) public view returns(uint256){
        return balanceOf[account];
    }

    function transfer(address _to, uint256 _value) public returns(bool success){

        require(_value > 0, "Transfer value must be > 0");
        require( _to != address(0),"Cannot transfer to address value Zero");
        require(balanceOf[msg.sender] >= _value,"Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender,_to,_value);
        return true;
    }

    function allowance (address _owner,address _spender)public view returns(uint256){
        return _allowance[_owner][_spender];
    }

    function approve(address _spender, uint256 _value) public returns(bool success){
        require(_spender != address(0) , "Cannot approve amount to a zero address");
        _allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender,_spender,_value);
        return true;
    }
    
    function transferfrom(address _from,address _to,uint256 _value)public returns(bool success){
        require( _to != address(0), "Cannot transfer to zero value address");
        require(_value <= balanceOf[_from],"Insufficient balance");
        require(_value <= _allowance[_from][msg.sender],"allowance exceeded");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        _allowance[_from][msg.sender] -= _value;

        emit Transfer(_from,_to,_value);
        return true;
    }

    function mint()public returns(bool success){
        require(_mintedSupply + Mint_Amount <= _totalSupply,"No more totalSupply");
        require(_mintedByUser[msg.sender] + Mint_Amount <= Mint_Limit,"Maximum limit reached");

        balanceOf[msg.sender] += Mint_Amount;
        _mintedSupply += Mint_Amount;
        _mintedByUser[msg.sender] += Mint_Amount;

        emit Mint(msg.sender,Mint_Amount);
        emit Transfer(address(0),msg.sender,Mint_Amount);
        return true;
    }

    function tokenLeft()public view returns(uint256){
        uint256 remainingTokenLeft = _totalSupply - _mintedSupply;
        return remainingTokenLeft;
    }
}