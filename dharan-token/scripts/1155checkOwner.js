import hre from "hardhat";

async function main() {
    const contract = await hre.ethers.getContractAt(
        "ItsMe",
        "0x668186D6605c6B34b6cD28Ef62D01B90913f74f8"
    );

    console.log("Owner:", await contract.owner());

    const [signer] = await hre.ethers.getSigners();
    console.log("Signer:", signer.address);
}

main().catch((error)=>{
    console.error(error);
    process.exitcode = 1;
});