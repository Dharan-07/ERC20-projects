import hre from "hardhat";

const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const provider = new ethers.JsonRpcProvider(
        process.env.BSC_TESTNET_RPC
    );

    const wallet = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        provider
    );

    const paymentType = 0;
    const recipient = "0x4A8354a8a1373fA4281CE9DeEa46eD9a774077F1";
    const caller = "0x8AEaa2EE2bF0529013cBF2dAd7d63f1C3a6360BB";
    const amount = hre.ethers.parseEther("0.00001");
    const nonce = 12;

    const hash = ethers.solidityPackedKeccak256(
        ["uint256", "address", "address", "uint256", "uint256"],
        [paymentType, recipient, caller, amount, nonce]
    );

    console.log("Hash:", hash);

    const signature = await wallet.signMessage(
        ethers.getBytes(hash)
    );

    console.log("Signature:", signature);

    const sig = ethers.Signature.from(signature);

    console.log("v:", sig.v);
    console.log("r:", sig.r);
    console.log("s:", sig.s);
    console.log("nonce:", nonce);
}

main().catch(console.error);