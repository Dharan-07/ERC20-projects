// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ASD_ICO is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    event TokenBuyed(address indexed to, uint256 amount);
    event TokenPerUSDPriceUpdated(uint256 amount);
    event PaymentTokenDetails(tokenDetail);
    event TokenAddressUpdated(address indexed tokenAddress);
    event SignerAddressUpdated(
        address indexed previousSigner,
        address indexed newSigner
    );
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    mapping(uint256 => tokenDetail) public paymentDetails;
    mapping(uint256 => bool) usedNonce;

    IERC20 public tokenAddress;

    address public signer;
    address public owner;
    uint256 public tokenAmountPerUSD = 10 * 10 ** 18;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    struct tokenDetail {
        string paymentName;
        address priceFetchContract;
        address paymentTokenAddress;
        uint256 decimal;
        bool status;
    }

    struct Sign {
        uint8 v;
        bytes32 r;
        bytes32 s;
        uint256 nonce;
    }

    constructor(address _ownerAddress, address _signerAddress, IERC20 _tokenAddress) {
        owner = _ownerAddress;
        signer = _signerAddress;
        tokenAddress = _tokenAddress;
        _grantRole(ADMIN_ROLE, owner);
        _grantRole(SIGNER_ROLE, signer);

        // BNB as the native token on BSC
        paymentDetails[0] = tokenDetail(
            "BSC",
            0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526,
            0x0000000000000000000000000000000000000000,
            18,
            true
        );

        // USDT token on BSC
        paymentDetails[1] = tokenDetail(
            "USDT",
            0xEca2605f0BCF2BA5966372C99837b1F182d3D620,
            0xcdE891ce4D45e9e28b957d14c56a364f898e751D,
            6,
            true
        );
    }

    function transferOwnership(address newOwner)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(newOwner != address(0), "Invalid Address");
        _revokeRole(ADMIN_ROLE, owner);
        address oldOwner = owner;
        owner = newOwner;
        _grantRole(ADMIN_ROLE, owner);
        emit OwnershipTransferred(oldOwner, owner);
    }

    function setSignerAddress(address signerAddress)
        external
        onlyRole(SIGNER_ROLE)
    {
        require(signerAddress != address(0), "Invalid Address");
        _revokeRole(SIGNER_ROLE, signer);
        address oldSigner = signer;
        signer = signerAddress;
        _grantRole(SIGNER_ROLE, signer);
        emit SignerAddressUpdated(oldSigner, signer);
    }

    function getLatestPrice(uint256 paymentType) public view returns(int256) {
        (, int256 price, , , ) = AggregatorV3Interface(
            paymentDetails[paymentType].priceFetchContract
        ).latestRoundData();
        return price;
    }

    function buyToken(
        address recipient,
        uint256 paymentType,
        uint256 tokenAmount,
        Sign memory sign
    ) external payable nonReentrant {
        require(paymentDetails[paymentType].status, "Invalid Payment");
        require(!usedNonce[sign.nonce], "Invalid Nonce");
        usedNonce[sign.nonce] = true;
        uint256 amount;
        if (paymentType == 0) {
            require(msg.value > 0 , "Invalid amount");

            verifySign(paymentType, recipient, msg.sender, msg.value, sign);
            amount = getToken(paymentType, msg.value);
        } else {
            require(tokenAmount > 0, "Invalid token amount");
            verifySign(paymentType, recipient, msg.sender, tokenAmount, sign);
            amount = getToken(paymentType, tokenAmount);
            IERC20(paymentDetails[paymentType].paymentTokenAddress).safeTransferFrom(
                msg.sender,
                address(this),
                tokenAmount
            );
        }
        tokenAddress.safeTransfer(recipient, amount);
        emit TokenBuyed(msg.sender, amount);
    }

    function getToken(uint256 paymentType, uint256 tokenAmount)
        public
        view
        returns (uint256 data)
    {
        uint256 price = uint256(getLatestPrice(paymentType));
        uint256 amount = price * tokenAmountPerUSD / 1e8;
        data = amount * tokenAmount / (10 ** paymentDetails[paymentType].decimal);
    }

    function recoverBNB(address walletAddress)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(walletAddress != address(0), "Null address");
        uint256 balance = address(this).balance;
        payable(walletAddress).transfer(balance);
    }

    function recoverToken(address _tokenAddress, address walletAddress, uint256 amount)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(walletAddress != address(0), "Null address");
        require(amount <= IERC20(_tokenAddress).balanceOf(address(this)), "Insufficient amount");
        IERC20(_tokenAddress).safeTransfer(
            walletAddress,
            amount
        );
    }

    function setPaymentTokenDetails(uint256 paymentType, tokenDetail memory _tokenDetails)
        external
        onlyRole(ADMIN_ROLE)
    {
        paymentDetails[paymentType] = _tokenDetails;
        emit PaymentTokenDetails(_tokenDetails);
    }

    function setTokenAddress(address _tokenAddress)
        external
        onlyRole(ADMIN_ROLE)
    {
        tokenAddress = IERC20(_tokenAddress);
        emit TokenAddressUpdated(address(tokenAddress));
    }

    function setTokenPricePerUSD(uint256 tokenAmount)
        external
        onlyRole(ADMIN_ROLE)
    {
        tokenAmountPerUSD = tokenAmount;
        emit TokenPerUSDPriceUpdated(tokenAmount);
    }

    function verifySign(
        uint256 assetType,
        address recipient,
        address caller,
        uint256 amount,
        Sign memory sign
    ) internal view {
        bytes32 hash = keccak256(
            abi.encodePacked(assetType, recipient, caller, amount, sign.nonce)
        );
        require(
            signer ==
                ecrecover(
                    keccak256(
                        abi.encodePacked(
                            "\x19Ethereum Signed Message:\n32",
                            hash
                        )
                    ),
                    sign.v,
                    sign.r,
                    sign.s
                ),
            "Owner sign verification failed"
        );
    }
}

//usdt contract address - 
// https://testnet.bscscan.com/address/0xcdE891ce4D45e9e28b957d14c56a364f898e751D

