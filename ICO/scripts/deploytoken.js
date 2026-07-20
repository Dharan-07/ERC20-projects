const { ethers, run } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying with:", deployer.address);

    const YAGC = await ethers.getContractFactory("ASD");

    const yagc = await YAGC.deploy(deployer.address);

    await yagc.waitForDeployment();

    const contractAddress = await yagc.getAddress();

    console.log("ASD deployed to:", contractAddress);

    console.log("Waiting for 6 confirmations...");
    await yagc.deploymentTransaction().wait(6);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [deployer.address],
        });

        console.log("✅ Contract Verified Successfully");
    } catch (error) {
        console.log("Verification failed:");
        console.log(error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});