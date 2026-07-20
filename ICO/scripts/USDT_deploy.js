const { ethers, run } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying with:", deployer.address);

    const USDT = await ethers.getContractFactory("usdt");

    const usdt = await USDT.deploy(deployer.address);

    await usdt.waitForDeployment();

    const contractAddress = await usdt.getAddress();

    console.log("USDT deployed to:", contractAddress);

    console.log("Waiting for confirmations...");
    await usdt.deploymentTransaction().wait(6);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [deployer.address],
        });

        console.log("Verification Successful");
    } catch (err) {
        console.log(err.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});