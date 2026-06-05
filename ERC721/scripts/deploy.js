import { network } from "hardhat";

async function main() {

    const { ethers } = await network.create();
     const [deployer] = await ethers.getSigners();
    console.log("Deploying from:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "BNB");
    console.log("Contract Deploying................");
    const myToken = await ethers.deployContract("contracts/Blackjack.sol:BlackJackCard", ["0xdB73d7dca98C15DB208bf6F3818a07E1c9189fc4"]  
    );
    await myToken.waitForDeployment();

    console.log(
        "Contract deployed to:",
        await myToken.getAddress()
    );
}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


// import hre from "hardhat";

// async function main() {
//     const [deployer] = await hre.ethers.getSigners();

//     console.log("Deploying from:", deployer.address);

//     const balance = await hre.ethers.provider.getBalance(deployer.address);
//     console.log("Balance:", hre.ethers.formatEther(balance), "BNB");

//     const myToken = await hre.ethers.deployContract(
//         "BlackJackCard",
//         ["0xdB73d7dca98C15DB208bf6F3818a07E1c9189fc4"]
//     );

//     await myToken.waitForDeployment();

//     console.log("Contract deployed to:", await myToken.getAddress());
// }

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });