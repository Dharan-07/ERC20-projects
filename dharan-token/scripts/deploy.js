import hre from "hardhat";

async function main() {

    const Batman = await hre.ethers.getContractFactory("Batman");

    const batman = await Batman.deploy();

    await batman.waitForDeployment();

    console.log("Batman deployed to:", await batman.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});