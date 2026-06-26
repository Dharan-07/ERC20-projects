import hre from "hardhat";

async function main() {
    await hre.run("verify:verify", {
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        constructorArguments: [
            "0xE668630b311F781AB6Aea037Af62b282D2808F3e",
            "0xE668630b311F781AB6Aea037Af62b282D2808F3e"
        ],
        contract: "contracts/staking/stakingContract.sol:StakingContract"
    });

    console.log("Contract verified successfully");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});