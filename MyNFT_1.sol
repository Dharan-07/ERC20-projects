// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

contract MyNFT {
    // ─── State ───────────────────────────────────────────────────────────────

    string public name;
    string public symbol;
    address public owner;

    uint256 private _nextTokenId;
    uint256 public mintPrice = 0.01 ether;
    uint256 public maxSupply = 10000;

    // tokenId => owner
    mapping(uint256 => address) private _ownerOf;
    // owner => token count
    mapping(address => uint256) private _balanceOf;
    // tokenId => approved address
    mapping(uint256 => address) private _approvals;
    // owner => operator => approved?
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    // tokenId => metadata URI
    mapping(uint256 => string) private _tokenURIs;

    // ─── Events ──────────────────────────────────────────────────────────────

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_ownerOf[tokenId] != address(0), "Token does not exist");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    // ─── ERC721 View Functions ────────────────────────────────────────────────

    function balanceOf(address _owner) public view returns (uint256) {
        require(_owner != address(0), "Zero address");
        return _balanceOf[_owner];
    }

    function ownerOf(uint256 tokenId) public view tokenExists(tokenId) returns (address) {
        return _ownerOf[tokenId];
    }

    function tokenURI(uint256 tokenId) public view tokenExists(tokenId) returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function getApproved(uint256 tokenId) public view tokenExists(tokenId) returns (address) {
        return _approvals[tokenId];
    }

    function isApprovedForAll(address _owner, address operator) public view returns (bool) {
        return _operatorApprovals[_owner][operator];
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    // ─── ERC165 ───────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == 0x80ac58cd || // ERC721
            interfaceId == 0x5b5e139f || // ERC721Metadata
            interfaceId == 0x01ffc9a7;   // ERC165
    }

    // ─── Approval Functions ───────────────────────────────────────────────────

    function approve(address to, uint256 tokenId) public tokenExists(tokenId) {
        address tokenOwner = _ownerOf[tokenId];
        require(
            msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender],
            "Not authorized"
        );
        _approvals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Cannot approve self");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    // ─── Transfer Functions ───────────────────────────────────────────────────

    function transferFrom(address from, address to, uint256 tokenId) public tokenExists(tokenId) {
        require(from == _ownerOf[tokenId], "Wrong owner");
        require(to != address(0), "Zero address");
        require(
            msg.sender == from ||
            msg.sender == _approvals[tokenId] ||
            _operatorApprovals[from][msg.sender],
            "Not authorized"
        );

        _balanceOf[from]--;
        _balanceOf[to]++;
        _ownerOf[tokenId] = to;
        delete _approvals[tokenId];

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "Non-ERC721Receiver");
    }

    // ─── Mint Functions ───────────────────────────────────────────────────────

    function mint(address to, string memory uri) public payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_nextTokenId < maxSupply, "Max supply reached");
        _mint(to, uri);
    }

    function ownerMint(address to, string memory uri) public onlyOwner {
        require(_nextTokenId < maxSupply, "Max supply reached");
        _mint(to, uri);
    }

    function _mint(address to, string memory uri) internal {
        require(to != address(0), "Zero address");

        uint256 tokenId = _nextTokenId++;
        _ownerOf[tokenId] = to;
        _balanceOf[to]++;
        _tokenURIs[tokenId] = uri;

        emit Transfer(address(0), to, tokenId);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        payable(owner).transfer(balance);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.code.length == 0) return true; // EOA, not a contract

        try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
            return retval == IERC721Receiver.onERC721Received.selector;
        } catch {
            return false;
        }
    }
}
