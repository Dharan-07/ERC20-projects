import hre from "hardhat";

async function main() {
    const Vest = await hre.ethers.getContractFactory("VestingContract");
    const vest = await Vest.deploy(
        "0xE668630b311F781AB6Aea037Af62b282D2808F3e",//  token
    );

    await vest.waitForDeployment();

    console.log("VestingContract deployed to : ", await vest.getAddress())
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})