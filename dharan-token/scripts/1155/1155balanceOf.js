import hre from "hardhat";
import promptSync from "prompt-sync";

async function main(){

    const prompt = promptSync();

    const contract = await hre.ethers.getContractAt(
        "ItsMe",
        "0x668186D6605c6B34b6cD28Ef62D01B90913f74f8"
    ); 

    const [signer] = await hre.ethers.getSigners();
    console.log("signer : ",signer.address);

// balance check

const id = prompt("Enter the Id :");
const account = prompt("Enter the address : ");

console.log("balance is:",await contract.balanceOf(account,id))
}

main().catch((error)=>{
    console.error(error);
    process.exitCode = 1;
})