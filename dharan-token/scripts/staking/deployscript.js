import hre from "hardhat";

async function main(){
    const Staking = await hre.ethers.getContractFactory("stakingToken");
    const staking = await Staking.deploy(
        "0x8AEaa2EE2bF0529013cBF2dAd7d63f1C3a6360BB",
        "0x8AEaa2EE2bF0529013cBF2dAd7d63f1C3a6360BB"
    );

    await staking.waitForDeployment();

    console.log("StakingToken deployed to : ",await staking.getAddress())
}

main().catch((error)=>{
    console.error(error);
    process.exitCode = 1;
})