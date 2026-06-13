//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public stakingContractStartedAt;
    uint256 public totalStaked;

    enum stakeOptions {
        None,
        FiveMin,
        TenMin,
        FifteenMin
    }

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 reward;
        stakeOptions period;
        bool active;
    }

    mapping(address => mapping(uint256 => Stake)) public stakeInfo;
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakeCount;

    event StakingStarted(
        address indexed user,
        uint256 indexed stakedId,
        uint256 amount,
        uint256 endTime
    );
    event Withdrawn(
        address indexed user,
        uint256 indexed stakedId,
        uint256 amount
    );

    constructor(IERC20 _stakingToken, IERC20 _rewardToken) Ownable(msg.sender) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        stakingContractStartedAt = block.timestamp;
    }

    function stake(uint256 amount,stakeOptions period) external nonReentrant returns (uint256) {
        require(amount > 0, "amount must be greater than zero");
        require(period != stakeOptions.None, "lock period must be specified");

        uint256 duration = _lockperiod(period);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 id = stakeCount[msg.sender];

        stakeInfo[msg.sender][id] = Stake({
            amount: amount,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            reward: 0,
            period: period,
            active: true
        });

        stakeCount[msg.sender]++;
        stakingBalance[msg.sender] += amount;
        totalStaked += amount;

        emit StakingStarted(msg.sender, id, amount, block.timestamp + duration);
        return id;
    }

    function withdraw(uint256 stakeId) external nonReentrant returns (bool) {
        require(stakeId < stakeCount[msg.sender], "Invalid stake");
        Stake storage userStake = stakeInfo[msg.sender][stakeId];

        require(userStake.active, "Already withdrawn");
        require(block.timestamp >= userStake.endTime, "stake still locked");
        require(userStake.amount > 0, "Nothing to withdraw");

        uint256 amount = userStake.amount;
        userStake.active = false;
        userStake.amount = 0;
        stakingBalance[msg.sender] -= amount;
        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, stakeId, amount);
        return true;
    }

    function _lockperiod(stakeOptions period) internal pure returns (uint256) {
        if (period == stakeOptions.FiveMin) {
            return 5 minutes;
        } else if (period == stakeOptions.TenMin) {
            return 10 minutes;
        } else if (period == stakeOptions.FifteenMin) {
            return 15 minutes;
        }

        revert("Invalid lock period");
    }

    function getStake(address user,uint256 stakeId) external view returns (Stake memory) {
        require(stakeId < stakeCount[user], "Invalid stake ID");
        return stakeInfo[user][stakeId];
    }

    function balanceOf(address user) external view returns (uint256) {
        return stakingBalance[user];
    }

    function isStakeActive(
        address user,
        uint256 stakeId
    ) external view returns (bool) {
        return stakeInfo[user][stakeId].active;
    }

    function getStakeCount(address user) external view returns (uint256) {
        return stakeCount[user];
    }

    function getAllStakes(address user) external view returns (Stake[] memory) {
        Stake[] memory stakes = new Stake[](stakeCount[user]);

        for (uint256 i = 0; i < stakeCount[user]; i++) {
            stakes[i] = stakeInfo[user][i];
        }

        return stakes;
    }
}