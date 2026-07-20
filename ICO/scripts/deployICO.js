const { ethers, run } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    // Change these if needed
    const owner = deployer.address;
    const signer = deployer.address;

    // Token users will receive when buying
    const tokenAddress = "0xcdE891ce4D45e9e28b957d14c56a364f898e751D";

    console.log("Deployer :", deployer.address);
    console.log("Owner    :", owner);
    console.log("Signer   :", signer);
    console.log("ICO Token:", tokenAddress);

    const ICO = await ethers.getContractFactory("ASD_ICO");

    const ico = await ICO.deploy(
        owner,
        signer,
        tokenAddress
    );

    await ico.waitForDeployment();

    const contractAddress = await ico.getAddress();

    console.log("ICO deployed at:", contractAddress);

    console.log("Waiting for 6 confirmations...");
    await ico.deploymentTransaction().wait(6);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [
                owner,
                signer,
                tokenAddress
            ],
        });

        console.log("✅ Verification Successful");
    } catch (error) {
        console.log("Verification failed:");
        console.log(error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});