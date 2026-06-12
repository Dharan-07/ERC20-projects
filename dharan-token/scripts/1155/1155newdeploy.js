import hre from "hardhat";

async function main(){
    const ITSME = await hre.ethers.getContractFactory("ItsMe");
    const itsme = await ITSME.deploy("0xdB73d7dca98C15DB208bf6F3818a07E1c9189fc4");
    await itsme.waitForDeployment();

    console.log("Contract address: ", await itsme.getAddress())
}

main().catch((error)=>{
    console.error(error);
    process.exitCode=1;
})