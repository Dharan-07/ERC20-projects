import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;


describe('SpidyToken',()=>{
    let SpidyToken, spidyToken, owner, addr1, addr2;
    const decimal = 18n;
    const unit = 10n ** decimal;

    beforeEach(async()=>{
        SpidyToken = await ethers.getContractFactory('SpidyToken');
        [owner,addr1,addr2,] = await ethers.getSigners();
        spidyToken = await SpidyToken.deploy(1000);
    })

    describe('deployment',()=>{
        it('Should set the right owner',async()=>{
            await expect(spidyToken.connect(addr1).burn()).to.be.revertedWith("only owner can call");
            await expect(spidyToken.connect(owner).burn()).to.not.be.reverted;
        }); 

        it('should assign the initial supply of token to the owner',async()=>{
            const ownerBalance = await spidyToken.balanceOf(owner.address);
            const totalSupply = await spidyToken.totalSupply();
            const expectedInitial = totalSupply / 10n; // initialSupply = totalSupply / 10
            expect(ownerBalance).to.equal(expectedInitial);
        });
    });

    describe('transaction',()=>{
        it('should transfer tokens between accounts',async()=>{

            await spidyToken.connect(owner).transfer(addr1.address,10n);
            const addr1Balance = await spidyToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(10n * unit);

            await spidyToken.connect(addr1).transfer(addr2.address,10n);
            const addr2Balance = await spidyToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(10n * unit);
        });

        it('should fail when trying to transfer more tokens than the balance',async()=>{
            await expect(spidyToken.connect(addr1).transfer(addr2.address,100n)).to.be.revertedWith("Insufficient balance");
        });
    });
});