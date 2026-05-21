import { expect } from 'chai';
import hre from "hardhat";

const { ethers } = hre

describe('Batman', () => {
    let batman, Batman, owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7;
    const decimal = 18n;
    const unit = 10n ** decimal;

    async function setUpwhiteList() {
        await batman.connect(owner).setWhiteList(addr3.address, true);
        await batman.connect(owner).setWhiteList(addr4.address, true);
        await batman.connect(owner).setWhiteList(addr5.address, true);
        await batman.connect(owner).setWhiteList(addr6.address, true);
        await batman.connect(owner).setWhiteList(addr7.address, true);

    }

    beforeEach(async () => {
        Batman = await ethers.getContractFactory('Batman');
        [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();
        batman = await Batman.deploy();
    });

    //
    //  :: deplyoment ::
    //

    describe('deployment', () => {

        it('should deploy with the right name', async () => {
            expect(await batman.name()).to.equal('Batman')
        });

        it('should deploy with the right symbol', async () => {
            expect(await batman.symbol()).to.equal('BTM')
        });

        it('should set the right owner', async () => {
            await expect(batman.connect(owner).burn()).to.not.be.reverted;
            await expect(batman.connect(addr1).burn()).to.be.revertedWith("only owner have access to this function");
        });

        it('should set the initial supply of 10% token to the owner', async () => {
            const ownerbalance = await batman.balanceOf(owner.address);
            const totalsupply = await batman.TotalToken();
            const expectedinitial = totalsupply / 10n;
            expect(ownerbalance).to.equal(expectedinitial);
            console.log(expectedinitial);
            console.log(ownerbalance);
        });

        it('Non owner should have zero balance initially', async () => {
            const bal = await batman.balanceOf(addr1.address);
            expect(bal).to.equal(0n)
        });
    });

    //
    //  :: whitelist checker ::
    //

    describe('whitelist checker', () => {
        it('owner can add users to  whitelist', async () => {
            await batman.connect(owner).setWhiteList(addr3.address, true);
            const list = await batman.getwhitelistedaddress();
            expect(list).to.include(addr3.address)
        });

        it('whitelist max address is 5', async () => {
            await setUpwhiteList();
            const list = await batman.getwhitelistedaddress();
            expect(list.length).to.equal(5);
        });

        it('owner can remove the whitelisted users', async () => {
            await batman.connect(owner).setWhiteList(addr7.address, true);
            await batman.connect(owner).removeFromWhiteList(addr7.address);
            const list = await batman.getwhitelistedaddress();
            expect(list).to.not.include(addr7.address)
        });

        it("non owner can't add setWhitelist", async () => {
            await expect(
                batman.connect(addr1).setWhiteList(addr5.address, true
                ))
                .to.be.revertedWith('only owner have access to this function');
        });

        it("non owner remove can't remove removeFromWhiteList", async () => {
            await expect(
                batman.connect(addr3).removeFromWhiteList(addr4.address))
                .to.be.revertedWith('only owner have access to this function');
        });

        it("can't add zero address to the whitelist", async () => {
            await expect(
                batman.connect(owner).setWhiteList(ethers.ZeroAddress, true
                )).to.be.revertedWith('invalid address');
        });

        it("whitelist exceed 5 users", async () => {
            await setUpwhiteList();
            await expect(
                batman.connect(owner).setWhiteList(addr1.address, true))
                .to.be.revertedWith("Whitelist full");
        });

        it("cannot remove a whitelisted address", async () => {
            await expect(
                batman.connect(owner).removeFromWhiteList(addr2.address))
                .to.be.revertedWith("User not WhiteListed")
        });

        it("removed address not to be appear in array", async () => {
            await batman.connect(owner).setWhiteList(addr3.address, true);
            const list1 = await batman.getwhitelistedaddress();
            console.log(list1);
            await batman.connect(owner).removeFromWhiteList(addr3.address);
            const list2 = await batman.getwhitelistedaddress();
            expect(list2).to.not.include(addr3.address);
            console.log(list2);
        });

        it("added whitelist to be add in array", async () => {
            const list1 = await batman.getwhitelistedaddress();
            console.log(list1);
            await batman.connect(owner).setWhiteList(addr6.address, true);
            const list2 = await batman.getwhitelistedaddress();
            expect(list2).to.include(addr6.address);
            console.log(list2);
        });
    });

    //
    // :: transfer :: 
    //

    describe('Transfer logic', () => {
        beforeEach(async () => {
            await setUpwhiteList();
        });

        it('receiver address not be zero', async () => {
            await expect(
                batman.connect(owner).transfer(ethers.ZeroAddress, 100n))
                .to.be.revertedWith("Cannot transfer to zero address");
        });

        it("sender balance can't be zero", async () => {
            await expect(batman.connect(addr1).transfer(addr5.address, 10n))
                .to.be.revertedWith("Insufficient balance");

            const bal = await batman.balanceOf(addr1.address);
            console.log(bal);
        });

        it("should burn 3% from the transfer", async () => {
            const amount = 100n;
            const amountwithdecimal = amount * unit;
            const burnAmount = (amountwithdecimal * 3n)/100n;

            const supplyBefore = await batman.TotalToken();
            await batman.connect(owner).transfer(addr1.address,amount);
            const supplyAfter = await batman.TotalToken();

            expect(supplyBefore-supplyAfter).to.equal(burnAmount);

            console.log("Supply before : ",supplyBefore)
            console.log("Supply after :",supplyAfter)

            const bal = await batman.balanceOf(addr1.address);
            console.log(" balance of receiver",bal);
            
        });
    });
})