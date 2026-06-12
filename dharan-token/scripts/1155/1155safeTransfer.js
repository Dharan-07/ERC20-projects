import hre from "hardhat";
import { Wallet, JsonRpcProvider } from "ethers";
import PromptSync from "prompt-sync";

async function main() {
    const prompt = PromptSync();

    const PRIVATE_KEY = process.env.ACC3_PRIVATE_KEY;
    const RPC_URL = process.env.SEPOLIA_RPC_URL
    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = new Wallet(PRIVATE_KEY,provider);

    const contractAddress = prompt("Enter the contract address : ")

    const itsme = await hre.ethers.getContractAt(
        "ItsMe",
        contractAddress,
        wallet
    )

    console.log("\n Function caller Wallet Address : ",wallet.address);

    const from = prompt("Enter from address : ");
    const to = prompt("Enter to address : ");
    const id = BigInt(prompt("Enter Id : "));
    const value = BigInt(prompt("Enter value : "));
    const data = prompt("Enter the data : ")

    const tx = await itsme.safeTransferFrom(
        from,
        to,
        id,
        value,
        data
    );

    console.log("\n Transaction hash",tx.hash)

    const receipt = await tx.wait();
    console.log(receipt);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})