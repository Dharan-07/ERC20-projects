// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VestingContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    struct VestingData {
        uint256 startTime;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 cliffPeriod;
        uint256 vestingPeriod;
        uint256 timeUnit; // like hrs, sec, days, hrs bacically 1 day = 20*60*60
        bool initialized;
    }

    mapping(address => mapping(uint256 => VestingData)) public vestingInfo;
    mapping(address => uint256) public vestingCount;

    event VestingCreated(
        address indexed beneficiary,
        uint256 indexed vestingId,
        uint256 amount,
        uint256 startTime,
        uint256 vestingPeriod
    );
    event TokenClaimed(
        address indexed beneficiary,
        uint256 indexed vestingId,
        uint256 amount
    );

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
        require(address(_token) != address(0), "Invalid token");
    }

    ///----------------
    /// WRITE FUNCTIONS
    ///----------------

    function vest(
        address beneficiary,
        uint256 amount,
        uint256 cliffPeriod,
        uint256 vestingPeriod,
        uint256 timeUnit
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid address");
        require(amount != 0, "Enter amount");
        require(vestingPeriod != 0, "Enter vestingPeriod");
        require(cliffPeriod <= vestingPeriod, "Invalid cliff");
        require(timeUnit > 0, "Invalid timeUnit");

        uint256 vestId = vestingCount[beneficiary];

        token.safeTransferFrom(msg.sender, address(this), amount);

        vestingInfo[beneficiary][vestId] = VestingData({
            startTime: block.timestamp,
            totalAmount: amount,
            claimedAmount: 0,
            cliffPeriod: cliffPeriod,
            vestingPeriod: vestingPeriod,
            timeUnit: timeUnit,
            initialized: true
        });

        vestingCount[beneficiary]++;

        emit VestingCreated(
            beneficiary,
            vestId,
            amount,
            block.timestamp,
            vestingPeriod
        );
    }

    function claim(uint256 vestId) external nonReentrant {
        uint256 claimable = claimableAmount(msg.sender, vestId);
        require(claimable > 0, "Nothing to claim");

        VestingData storage v = vestingInfo[msg.sender][vestId];

        unchecked {
            // safe: claimable is always <= totalAmount - claimedAmount, proven in claimableAmount()
            v.claimedAmount += claimable;
        }

        token.safeTransfer(msg.sender, claimable);

        emit TokenClaimed(msg.sender, vestId, claimable);
    }

    function claimAll() external {
        uint256 total;

        for (uint256 i = 0; i < vestingCount[msg.sender]; i++) {
            uint256 claimable = claimableAmount(msg.sender, i);

            if (claimable > 0) {
                vestingInfo[msg.sender][i].claimedAmount += claimable;
                total += claimable;

                 emit TokenClaimed(msg.sender, i, claimable); // to get info about each vestId
            }
        }

        require(total > 0, "Nothing to claim");

        token.safeTransfer(msg.sender, total);
    }

    ///--------------
    /// READ FUNCTION
    ///--------------

    function releasedAmount(
        address beneficiary,
        uint256 vestId
    ) public view returns (uint256) {
        VestingData memory v = vestingInfo[beneficiary][vestId];

        require(v.initialized, "Invalid vesting");

        return _releasedAmount(v);
    }

    function _releasedAmount(
        VestingData memory v
    ) internal view returns (uint256) {
        uint256 elapsedPeriods = (block.timestamp - v.startTime) / v.timeUnit;

        if (elapsedPeriods < v.cliffPeriod) {
            return 0;
        }

        if (elapsedPeriods >= v.vestingPeriod) {
            return v.totalAmount;
        }

        return (v.totalAmount * elapsedPeriods) / v.vestingPeriod;
    }

    function claimableAmount(
        address beneficiary,
        uint256 vestId
    ) public view returns (uint256) {
        require(beneficiary != address(0), "Invalid address");
        VestingData memory v = vestingInfo[beneficiary][vestId];

        require(v.initialized, "Invalid Vesting");

        uint256 released = _releasedAmount(v);

        if (released <= v.claimedAmount) {
            return 0;
        }

        return released - v.claimedAmount;
    }

    ///--------------
    /// RECOVER TOKEN
    ///--------------

    function recoverToken(
        IERC20 otherToken,
        uint256 amount
    ) external onlyOwner {
        require(
            address(otherToken) != address(token),
            "cannot recover vesting token"
        );
        otherToken.safeTransfer(owner(), amount);
    }
}