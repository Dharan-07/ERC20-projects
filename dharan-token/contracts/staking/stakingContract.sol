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

    // reward percentage
    uint256 public rewardFiveMin = 2;
    uint256 public rewardTenMin = 5;
    uint256 public rewardFifteenMin = 10;

    // emergencyWithdrawFee

    uint256 public feeFiveMin = 2;
    uint256 public feeTenMin = 3;
    uint256 public feeFifteenMin = 5;

    uint256 public collectedFees;

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
        uint256 rewardRate; // reawrd raet store in the struct while staking 
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
        uint256 amount,
        uint256 reward
    );
    event UpdateReward(
        uint256 FiveMin, 
        uint256 TenMin, 
        uint256 FifeTeenMin
    );
    event UpdateFee(
        uint256 feeFiveMin, 
        uint256 feeTenMin,
        uint256 feeFifteenMin
    );

    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed stakeId,
        uint256 amount,
        uint256 fee
    );

    constructor(IERC20 _stakingToken, IERC20 _rewardToken) Ownable(msg.sender) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        stakingContractStartedAt = block.timestamp;
    }

    function stake(
        uint256 amount,
        stakeOptions period
    ) external nonReentrant returns (uint256) {
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
            rewardRate: _getRewardRate(period),
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
        uint256 reward = calculateReward(msg.sender, stakeId);
        userStake.reward = reward;
        userStake.active = false;
        userStake.amount = 0;

        stakingBalance[msg.sender] -= amount;
        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        if (reward > 0 ){
            require(rewardToken.balanceOf(address(this)) >= reward,"Insufficient reward tokens");
            rewardToken.safeTransfer( msg.sender, reward);
        }

        emit Withdrawn(msg.sender, stakeId, amount, reward);
        return true;
    }

    function calculateReward(
        address user,
        uint256 stakeId
    ) public view returns (uint256) {
        require(stakeId < stakeCount[user], "Invalid stake");
        Stake memory perId = stakeInfo[user][stakeId];

        if (!perId.active) {
            return 0;
        }
        return perId.amount*perId.rewardRate / 100;
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

    function getStake(
        address user,
        uint256 stakeId
    ) external view returns (Stake memory) {
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
        require(stakeId < stakeCount[user], "Invalid stake");
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

    function setReward(
        uint256 five,
        uint256 ten,
        uint256 fifteen
    ) external onlyOwner {
        rewardFiveMin = five;
        rewardTenMin = ten;
        rewardFifteenMin = fifteen;

        emit UpdateReward(five, ten, fifteen);
    }

    function setEmergencyWithdrawFee(uint256 five, uint256 ten, uint256 fifteen) external onlyOwner {
        require(five <= 10, "Fees must be less than 10%");
        require(ten <= 10, "Fees must be less than 10%");
        require(fifteen <= 10, "Fees must be less than 10%");

        emit UpdateFee(five,ten,fifteen);

        feeFiveMin = five;
        feeTenMin = ten;
        feeFifteenMin = fifteen;
    }

    function depositRewardTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Invalid Amount");

        rewardToken.safeTransferFrom( 
            msg.sender,
            address(this), 
            amount);
    }

    function emergencyWithdraw(uint256 stakeId) external nonReentrant returns(bool){
        require(stakeId < stakeCount[msg.sender],"Invalid stakeId");

        Stake storage userStake = stakeInfo[msg.sender][stakeId];
        require(userStake.active,"Already Withdrawn");

        uint256 amount = userStake.amount;
        uint256 feeRate = _getEmergencyFee(userStake.period);
        uint256 fee = amount * feeRate / 100 ;

        uint256 withDeduction = amount - fee;

        collectedFees += fee ;

        userStake.active = false;
        userStake.amount = 0 ;

        stakingBalance[msg.sender] -= amount;
        totalStaked -= amount;

        stakingToken.safeTransfer(
            msg.sender,
            withDeduction
        );

        emit EmergencyWithdraw(msg.sender, stakeId, withDeduction, fee);

        return true;
    }

    function withdrawCollectedFee(address to) external onlyOwner{
        require( to != address(0),"Invalid addresss");

        uint256 amount = collectedFees;

        require(amount > 0 ,"No fees");

        collectedFees = 0;

        stakingToken.safeTransfer(to, amount);
    }

    function _getRewardRate(stakeOptions period) internal view returns(uint256) {
        if(period == stakeOptions.FiveMin){
            return rewardFiveMin;
        }
        if(period == stakeOptions.TenMin){
            return rewardTenMin;
        }
        if(period == stakeOptions.FifteenMin){
            return rewardFifteenMin;
        }

        revert("Invalid period");
    }

    function _getEmergencyFee(stakeOptions period) internal view returns(uint256){

        if(period == stakeOptions.FiveMin){
            return feeFiveMin;
        }
        if(period == stakeOptions.TenMin){
            return feeTenMin;
        }
        if(period == stakeOptions.FifteenMin){
            return feeFifteenMin;
        }

        revert("Invalid period");
    }
}