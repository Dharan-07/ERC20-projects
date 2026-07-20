const { run } = require("hardhat");

async function main() {

    const contractAddress = "0xcdE891ce4D45e9e28b957d14c56a364f898e751D";

    const owner = "0x8AEaa2EE2bF0529013cBF2dAd7d63f1C3a6360BB";

    await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [owner],
    });

    console.log("Verified Successfully");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
