import hre from "hardhat";

async function main() {
    await hre.run("verify:verify", {
        address: "0x668186D6605c6B34b6cD28Ef62D01B90913f74f8",
        constructorArguments: [
            "0xdB73d7dca98C15DB208bf6F3818a07E1c9189fc4"
        ],
        contract: "contracts/own/1155new.sol:ItsMe"
    });

    console.log("Contract verified successfully");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});