import hre from "hardhat";

async function main() {
    const Staking = await hre.ethers.getContractFactory("StakingContract");
    const staking = await Staking.deploy(
        "0xE668630b311F781AB6Aea037Af62b282D2808F3e",// staking token
        "0xE668630b311F781AB6Aea037Af62b282D2808F3e"// reward token
    );

    await staking.waitForDeployment();

    console.log("StakingContract deployed to : ", await staking.getAddress())
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})