import hre from "hardhat";

async function main() {

    const contractAddress = "0x668186D6605c6B34b6cD28Ef62D01B90913f74f8";

    const itsMe = await hre.ethers.getContractAt(
        "ItsMe",
        contractAddress
    )

    const owner = await itsMe.owner();
    console.log("Contract Owner:", owner);

    const [signer] = await hre.ethers.getSigners();
    console.log("Signer Address:",signer.address);

    const account = "0x4A8354a8a1373fA4281CE9DeEa46eD9a774077F1";
    const tokenId = 1;
    const amount = 10;

    const tx = await itsMe.burn(
        account,
        tokenId,
        amount
    )

    console.log("Transaction hash",tx.hash);

    const receipt = await tx.wait();

    console.log("\n=== Transaction Receipt ===");
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());
    console.log("Status:", receipt.status);

    console.log("\n--Done--")
}

main().catch((error) => {
    console.error(error);

    process.exitCode = 1;
})