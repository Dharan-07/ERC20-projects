//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Batman {
    string private constant _name = "Batman";
    string private constant _symbol = "BTM";
    uint256 private constant _decimals = 18;

    address private owner;
    uint256 private totalSupply = 10000000000 * (10 ** _decimals);
    uint256 private initialSupply = totalSupply;
    uint256 private mintedSupply;

    uint256 private constant Mint_Amount = 10 * (10 ** _decimals);
    uint256 private constant Mint_Limit = 100 * (10 ** _decimals);
    uint256 private constant Max_Supply = 10000000000 * (10 ** _decimals);

    address[] private whiteListedUsers;

    mapping(address => uint256) private balances;
    mapping(address => bool) private isWhitelisted;
    mapping(address => mapping(address => uint256)) private _allowance;
    mapping(address => uint256) private mintedByUser;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event WhiteListUpdate(address indexed user, bool status);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Mint(address indexed to, uint256 value);

    constructor() {
        owner = msg.sender;
        uint256 ownerFund = initialSupply / 10;
        uint256 reservefund = totalSupply-ownerFund;
        balances[address(this)] = reservefund;
        balances[owner] = ownerFund;
        initialSupply -= ownerFund;
    }

    function name() public pure returns (string memory) {
        return _name;
    }

    function symbol() public pure returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint256) {
        return _decimals;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner have access to this function");
        _;
    }

    function TotalToken() public view returns (uint256) {
        return totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function transfer(
        address to,
        uint256 amount
    ) public returns (bool success) {
        uint256 amountwithdecimal = amount * (10 ** _decimals);
        require(
            balances[msg.sender] >= amountwithdecimal,
            "Insufficient balance"
        );
        require(to != address(0), "Cannot transfer to zero address");
        require(whiteListedUsers.length >= 5, "Need 5 whitelisted users");
        balances[msg.sender] -= amountwithdecimal;
        uint256 valueaftertax = (amountwithdecimal * 3) / 100; // 3% burn
        uint256 whitelistreward = (amountwithdecimal * 1) / 100; // 1% for whitelist
        uint256 totalWhiteListreward = whitelistreward * 5;
        uint256 deductionTaxValue = valueaftertax + totalWhiteListreward;
        uint256 remainingvalue = amountwithdecimal - deductionTaxValue;
        balances[to] += remainingvalue;
        totalSupply -= valueaftertax;

        for (uint256 i = 0; i < 5; i++) {
            if (isWhitelisted[whiteListedUsers[i]]) {
                balances[whiteListedUsers[i]] += whitelistreward;
                emit Transfer(msg.sender, whiteListedUsers[i], whitelistreward);
            }
        }

        emit Transfer(msg.sender, to, remainingvalue);
        emit Transfer(msg.sender, address(0), valueaftertax);
        return true;
    }

    function setWhiteList(address user, bool status) public onlyOwner {
        require(user != address(0), "invalid address");

        if (status == true && !isWhitelisted[user]) {
            require(whiteListedUsers.length < 5, "Whitelist full");
            whiteListedUsers.push(user);
        }
        isWhitelisted[user] = status;
        emit WhiteListUpdate(user, status);
    }

    function getwhitelistedaddress() public view returns (address[] memory) {
        return whiteListedUsers;
    }

    function removeFromWhiteList(address user) public onlyOwner {
        require(isWhitelisted[user], "User not WhiteListed");
        for (uint256 i; i < whiteListedUsers.length; i++) {
            if (user == whiteListedUsers[i]) {
                whiteListedUsers[i] = whiteListedUsers[
                    whiteListedUsers.length - 1
                ];
                whiteListedUsers.pop();
                isWhitelisted[user] = false;
                emit WhiteListUpdate(user, false);

                break;
            }
        }
    }

    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256) {
        return _allowance[_owner][_spender];
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        uint256 approveValueWithDecimal = _value * (10 ** _decimals);
        require(
            _spender != address(0),
            "Cannot approve amount to a zero address"
        );
        _allowance[msg.sender][_spender] = approveValueWithDecimal;

        emit Approval(msg.sender, _spender, approveValueWithDecimal);
        return true;
    }

    function mint() public onlyOwner returns(bool success) {
        require(totalSupply + Mint_Amount <= Max_Supply, "Max supply exceeded");
        require(
            mintedByUser[msg.sender] + Mint_Amount <= Mint_Limit,
            "Maximum limit reached"
        );

        balances[msg.sender] += Mint_Amount;
        mintedSupply += Mint_Amount;
        mintedByUser[msg.sender] += Mint_Amount;
        totalSupply += Mint_Amount;

        emit Mint(msg.sender, Mint_Amount);
        emit Transfer(address(0), msg.sender, Mint_Amount);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        uint256 transferfrom_withdecimal = _value * (10 ** _decimals);
        require(_to != address(0), "Cannot transfer to zero address");
        require(
            transferfrom_withdecimal <= balances[_from],
            "Insufficient balance"
        );
        require(
            transferfrom_withdecimal <= _allowance[_from][msg.sender],
            "Allowance exceeded"
        );
        require(whiteListedUsers.length >= 5, "Need 5 whitelisted users");

        balances[_from] -= transferfrom_withdecimal;
        _allowance[_from][msg.sender] -= transferfrom_withdecimal;
        uint256 burnTax = (transferfrom_withdecimal * 3) / 100;
        uint256 whitelistReward = (transferfrom_withdecimal * 1) / 100;
        uint256 totalWhitelistReward = whitelistReward * 5;
        uint256 totalDeduction = burnTax + totalWhitelistReward;

        uint256 remainingvalue = transferfrom_withdecimal - totalDeduction;
        balances[_to] += remainingvalue;
        totalSupply -= burnTax;

        for (uint256 i = 0; i < 5; i++) {
            if (isWhitelisted[whiteListedUsers[i]]) {
                balances[whiteListedUsers[i]] += whitelistReward;
                emit Transfer(_from, whiteListedUsers[i], whitelistReward);
            }
        }
        emit Transfer(_from, _to, remainingvalue);
        emit Transfer(_from, address(0), burnTax);

        return true;
    }

    function increaseAllowance(
        address spender,
        uint256 value
    ) public returns (bool success) {
        require(
            spender != address(0),
            "Cannot increase allowance to address value Zero"
        );

        uint256 increaseValueWithDecimal = value * (10 ** _decimals);
        _allowance[msg.sender][spender] += increaseValueWithDecimal;

        emit Approval(msg.sender, spender, _allowance[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(
        address spender,
        uint256 value
    ) public returns (bool success) {
        require(
            spender != address(0),
            "cannot decrease allowance to address value Zero"
        );

        uint256 decreaseValueWithDecimal = value * (10 ** _decimals);
        require(
            _allowance[msg.sender][spender] >= decreaseValueWithDecimal,
            "Insufficient allowance balance to decrease"
        );
        _allowance[msg.sender][spender] -= decreaseValueWithDecimal;

        emit Approval(msg.sender, spender, _allowance[msg.sender][spender]);
        return true;
    }

    function burn() public onlyOwner returns (bool) {
        require(
            balances[msg.sender] >= Mint_Amount,
            "Insufficient balance to burn"
        );

        balances[msg.sender] -= Mint_Amount;

        totalSupply -= Mint_Amount;

        emit Transfer(msg.sender, address(0), Mint_Amount);

        return true;
    }
}