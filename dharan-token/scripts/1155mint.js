// import hre from "hardhat";

// async function main() {
//     const contractAddress = "0x668186D6605c6B34b6cD28Ef62D01B90913f74f8";

//     const itsMe = await hre.ethers.getContractAt(
//         "ItsMe",
//         contractAddress
//     );

//     const tx = await itsMe.mint(
//         "0x4A8354a8a1373fA4281CE9DeEa46eD9a774077F1", // account
//         1,                    // token id
//         10,                   // amount
//         "0x"                  // empty bytes
//     );

//     await tx.wait();

//     console.log("Mint successful");
// }

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

import hre from "hardhat";
import promptSync from "prompt-sync";

   async function main() {

    const prompt = promptSync();
    const contractAddress = "0x668186D6605c6B34b6cD28Ef62D01B90913f74f8";

    console.log("Connecting to contract:", contractAddress);

    const itsMe = await hre.ethers.getContractAt(
        "ItsMe",
        contractAddress
    );

    const [signer] = await hre.ethers.getSigners();

    console.log("Signer Address:", signer.address);

    try {
        const owner = await itsMe.owner();
        console.log("Contract Owner:", owner);
    } catch (err) {
        console.log("Could not fetch owner:", err.message);
    }

    const account = prompt("Enter the receiver address : ");
    const tokenId = prompt("Enter the token Id : ");
    const amount = prompt("Total token count to mint : ");
    const data = "0x";

    console.log("\n=== Mint Inputs ===");
    console.log("Recipient:", account);
    console.log("Token ID:", tokenId);
    console.log("Amount:", amount);
    console.log("Data:", data);

    console.log("\nSending mint transaction...");

    const tx = await itsMe.mint(
        account,
        tokenId,
        amount,
        data
    );

    console.log("Transaction Hash:", tx.hash);

    const receipt = await tx.wait();

    console.log("\n=== Transaction Receipt ===");
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());
    console.log("Status:", receipt.status);

    console.log("\nMint successful!");
}

main().catch((error) => {
    console.error("\n=== ERROR ===");
    console.error(error);
    process.exitCode = 1;
});