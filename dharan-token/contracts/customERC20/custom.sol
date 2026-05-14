//SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;

contract custom {
    address private owner;
    string private constant tokenName = "Lahlahlah";
    string private constant tokenSymbol = "LAH";
    uint256 private constant decimal = 18;
    uint256 private Taxpercentage;
    uint256 private burnTax;
    
    uint256 private constant initialSupply = 10000000000 * (10 ** 18);
    uint256 private totalSupply = initialSupply;

    address[] private whiteListedAddress;
    
    event Burn(uint256 amount, uint256 percentage);
    event whitelistupdated(address indexed user, bool status);

    constructor() {
        owner = msg.sender;
    }

    mapping(address => bool) private isWhitelisted;

    function total_Supply_remain() public view returns (uint256) {
        return totalSupply;
    }

    function Supply_total() public pure returns(uint256){
        return initialSupply;
    }

    function TokenName() public pure returns (string memory) {
        return tokenName;
    }

    function TokenSymbol() public pure returns (string memory) {
        return tokenSymbol;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call");
        _;
    }

    function setWhitelist(address user, bool status) public onlyOwner {
        require(user != address(0), "Invalid address");
        require(!isWhitelisted[user], "Address is already whitelisted");

        if (status == true && !isWhitelisted[user]) {
            require(
                whiteListedAddress.length < 5,
                "Limit for the whitelisted is 5"
            );
            whiteListedAddress.push(user);
        }
        isWhitelisted[user] = status;
        emit whitelistupdated(user, status);
    }

    function getWhitelistedAddress() public view returns (address[] memory) {
        return whiteListedAddress;
    }

    function setburntax(uint256 _burnTax) public onlyOwner {
        require(_burnTax > 0 && _burnTax <= 3,"Invalid tax value");
        require(Taxpercentage + _burnTax <= 3,"Total tax cannot exceed 3%");
        burnTax += _burnTax;
    }

    function burn() public onlyOwner {
        require(burnTax > 0,"Burn tax must be set before burning");
        
        uint256 burnValue = (initialSupply * burnTax) / 100;
        totalSupply -= burnValue;
        Taxpercentage += burnTax;

        emit Burn(burnValue, burnTax);
        burnTax = 0;
    }

    function pertaxvalue() public view returns (uint256) {
        return burnTax;
    }

    function burntaxtotalvalue() public view returns (uint256) {
        return Taxpercentage;
    }
}