//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingContract is Ownable , ReentrancyGuard{

    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public stakingContractStartedAt;
    uint256 public totalStaked;

    enum stakeOptions { None, FiveMin, TenMin, FifteenMin }

    struct Stake{
        uint256 amount;
        uint256 startTime;
        uint256 reward;
        uint256 stakingDuration;
        stakeOptions period;
    }
    
    mapping(address => Stake[]) internal stakeInfo;
    mapping(address => uint256) internal stakingBalance;

    event StakingStarted(address indexed user, uint256 amount, uint256 time);
    event Withdrawn(address indexed user,uint256 amount);

    constructor(IERC20 _stakingToken,IERC20 _rewardToken)Ownable(msg.sender){
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        stakingContractStartedAt = block.timestamp;
    }

    function stake(uint256 amount,stakeOptions period) external nonReentrant returns(bool){
        require(amount>0,"amount must be greater than zero");
        require(period != stakeOptions.None,"lock period must be specified");

        uint256 duration = _lockperiod(period);
        stakingToken.safeTransferFrom(msg.sender,address(this),amount);

        stakeInfo[msg.sender].push(Stake({
            amount: amount,
            startTime: block.timestamp,
            reward: 0,
            stakingDuration: duration,
            period: period
        }));

        stakingBalance[msg.sender] += amount;
        totalStaked += amount;

        emit StakingStarted(msg.sender,amount,block.timestamp);
        return true;
    }

    function withdraw(uint256 index) external nonReentrant returns(bool){
        require(index < stakeInfo[msg.sender].length , "Invalid stake");
        Stake storage userstake = stakeInfo[msg.sender][index];

        require(userstake.amount > 0 , "Amount already withdrawn");
        require(block.timestamp >= userstake.startTime + userstake.stakingDuration,"staking is still locked");

        uint256 amount = userstake.amount;
        stakingBalance[msg.sender] -= amount;
        totalStaked -= amount;
        userstake.amount = 0;

        uint256 lastindex = stakeInfo[msg.sender].length - 1;

        if (index != lastindex){
            stakeInfo[msg.sender][index] = stakeInfo[msg.sender][lastindex];
        }

        stakeInfo[msg.sender].pop();

        stakingToken.safeTransfer(msg.sender,amount);

        emit Withdrawn(msg.sender, amount);
        return true;
    }

    function _lockperiod(stakeOptions period) internal pure returns(uint256){

        if(period == stakeOptions.FiveMin){
            return 5 minutes;
        }else if(period == stakeOptions.TenMin){
            return 10 minutes;
        }else if(period == stakeOptions.FifteenMin){
            return 15 minutes;
        }

        revert("Invalid lock period");
    }

    function getStake(address user)external view returns(Stake[] memory){
        return stakeInfo[user];
    }
    
    function balanceOf(address user) external view returns(uint256){
        return stakingBalance[user];
    }
}