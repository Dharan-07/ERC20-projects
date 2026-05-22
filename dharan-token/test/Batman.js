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
            console.log(expectedinitial, " : expected ");
            console.log(ownerbalance, " : owner balance");
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

        it("WhiteListUpdate event should emit after adding the address", async () => {
            await expect(
                batman.connect(owner).setWhiteList(addr5.address, true))
                .to.emit(batman, "WhiteListUpdate");
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
            const burnAmount = (amountwithdecimal * 3n) / 100n;

            const supplyBefore = await batman.TotalToken();
            await batman.connect(owner).transfer(addr1.address, amount);
            const supplyAfter = await batman.TotalToken();

            expect(supplyBefore - supplyAfter).to.equal(burnAmount);

            console.log(supplyBefore, " : Supply before")
            console.log(supplyAfter, " : Supply after")

            const bal = await batman.balanceOf(addr1.address);
            console.log(" balance of receiver", bal);
        });

        it("should transfer 1% to the whitelisted address", async () => {
            const amount = 100n;
            const amountwithdecimal = amount * unit;
            const rewardforwhitelist = (amountwithdecimal * 1n) / 100n

            const balancebefore = await batman.balanceOf(addr7.address);
            await batman.connect(owner).transfer(addr2.address, amount);
            const balanceafter = await batman.balanceOf(addr7.address);
            expect(balanceafter - balancebefore).to.equal(rewardforwhitelist);

            console.log(balancebefore, " : before");
            console.log(balanceafter, " : after");
            console.log(rewardforwhitelist, " : reward amount")
        });

        it("should be able to transfer after whitelist", async () => {
            const amount = 100n;
            const amountwithdecimal = amount * unit;
            const burntax = (amountwithdecimal * 3n) / 100n;
            const whitetax = (amountwithdecimal * 1n) / 100n;

            const totaltax = burntax + (whitetax * 5n);
            const tokenwillget = amountwithdecimal - totaltax;
            await batman.connect(owner).transfer(addr2.address, amount);

            expect(await batman.balanceOf(addr2.address)).to.equal(tokenwillget);
        });

        it("receiver can't receive the full amount", async () => {
            const amount = 100n;
            await batman.connect(owner).transfer(addr5.address, amount)
            const balance = await batman.balanceOf(addr5.address);
            expect(balance).to.not.equal(amount * unit);
            console.log(balance, " : received amount");
            console.log(amount * unit, " : raw amount");
        });

        it("Transfer event should emit after successful transfer", async () => {
            await expect(
                batman.connect(owner).transfer(addr4.address, 100n))
                .to.emit(batman, "Transfer");
        })
    });

    //
    // :: Transfer - without whitelist ::
    //

    describe('Transfer - without whitelist', () => {
        it("can't able to transfer without setting the whitelist ", async () => {
            const amount = 1000n;
            await expect(
                batman.connect(owner).transfer(addr2.address, amount))
                .to.be.revertedWith("Need 5 whitelisted users");
        });
    });

    //
    // :: Approve @ allowance ::
    //

    describe("Approve @ allowance", () => {
        beforeEach(async () => {
            await setUpwhiteList();
        });
        it("Owner can approve spender", async () => {
            await batman.connect(owner).approve(addr1.address, 200n);
            const balance = await batman.allowance(owner.address, addr1.address);
            expect(balance).to.equal(200n * unit);
        });

        it("user can approve value to others", async () => {
            await batman.connect(owner).transfer(addr2.address, 100n);
            await batman.connect(addr2).approve(addr1.address, 50n);
            const balance = await batman.allowance(addr2.address, addr1.address);
            expect(balance).to.equal(50n * unit);
            console.log(balance, " : approved allowance for spender");
            const bal_of_approver = await batman.balanceOf(addr2.address);
            console.log(bal_of_approver, " : balance of the current approver");
        });

        it("spender address can't be zero", async () => {
            await expect(
                batman.connect(owner).approve(ethers.ZeroAddress, 100n))
                .to.be.revertedWith("Cannot approve amount to a zero address");
        });

        it("Approval event should be emitted with approve", async () => {
            await expect(
                batman.connect(owner).approve(addr1.address, 100n))
                .to.emit(batman, "Approval")
                .withArgs(owner.address, addr1.address, 100n * unit);
        });

        it("allowance should be zero before approve", async () => {
            const allowed = await batman.allowance(owner.address, addr1.address);
            expect(allowed).to.equal(0n);
        });
    });

    //
    // Increase @ Decrease allowance
    //

    describe("Increase @ Decrease allowance", () => {

        it("Cannot Increase allowance for zero address", async () => {
            await expect(batman.connect(owner).increaseAllowance(ethers.ZeroAddress, 50n))
                .to.be.revertedWith("Cannot increase allowance to address value Zero");
        });

        it("Can Increase allowance", async () => {
            await batman.connect(owner).approve(addr1.address, 100n);
            await batman.connect(owner).increaseAllowance(addr1.address, 50n);
            const allowed = await batman.allowance(owner.address, addr1.address);
            expect(allowed).to.equal(150n * unit);
            console.log(allowed);
            console.log(150n * unit);
        });

        it("Cannot Decrease allowance for zero address", async () => {
            await expect(batman.connect(owner).decreaseAllowance(ethers.ZeroAddress, 50n))
                .to.be.revertedWith("cannot decrease allowance to address value Zero");
        });

        it("Can Decrease allowance", async () => {
            await batman.connect(owner).approve(addr1.address, 100n);
            await batman.connect(owner).decreaseAllowance(addr1.address, 50n);
            const allowed = await batman.allowance(owner.address, addr1.address);
            expect(allowed).to.equal(50n * unit);
            console.log(allowed);
            console.log(50n * unit);
        });

        it(" Other user can Increase allowance", async () => {
            await batman.connect(addr4).approve(addr1.address, 100n);
            await batman.connect(addr4).increaseAllowance(addr1.address, 50n);
            const allowed = await batman.allowance(addr4.address, addr1.address);
            expect(allowed).to.equal(150n * unit);
        });

        it("Other user can Decrease allowance", async () => {
            await batman.connect(addr4).approve(addr1.address, 100n);
            await batman.connect(addr4).decreaseAllowance(addr1.address, 50n);
            const allowed = await batman.allowance(addr4.address, addr1.address);
            expect(allowed).to.equal(50n * unit);
        });

        it("Approval event should emit while Increase allowance", async () => {
            await batman.connect(addr4).approve(addr1.address, 100n);
            await expect(
                batman.connect(addr4).increaseAllowance(addr1.address, 50n))
                .to.emit(batman, "Approval");
        });

        it("Can't decrease allowance below zero", async () => {
            await batman.connect(addr2).approve(addr3.address, 20n);
            await expect(
                batman.connect(addr2).decreaseAllowance(addr3.address, 50n))
                .to.be.revertedWith("Insufficient allowance balance to decrease");
        });
    });

    //
    // :: Transfer from ::
    //

    describe("Transferfrom", async () => {
        beforeEach(async () => {
            await setUpwhiteList();
            await batman.connect(owner).approve(addr1, 200n)
        })

        it("Cannot tranferFrom to zero address", async () => {
            await expect(
                batman.connect(addr1).transferFrom(owner.address, ethers.ZeroAddress, 100n))
                .to.be.revertedWith("Cannot transfer to zero address");
        });

        it("spender can transferfrom with in allowance", async () => {
            const amount = 100n;
            const amountwithdecimal = amount * unit;
            const burntax = (amountwithdecimal * 3n) / 100n;
            const whiteTax = ((amountwithdecimal * 1n) / 100n) * 5n;
            const totaltax = burntax + whiteTax;
            const receiveamount = amountwithdecimal - totaltax;

            await batman.connect(addr1).transferFrom(owner.address, addr2.address, amount);
            expect(await batman.balanceOf(addr2.address)).to.equal(receiveamount);
        });

        it("allowance reduced after transerfrom", async () => {
            await batman.connect(addr1).transferFrom(owner.address, addr2.address, 100n);
            expect(await batman.allowance(owner.address, addr1.address)).to.equal(100n * unit);
        });

        it("should burn 3% for the transferfrom", async () => {
            const amount = 100n;
            const amountwithdecimal = amount * unit;
            const burnAmount = (amountwithdecimal * 3n) / 100n;

            const supplyBefore = await batman.TotalToken();
            await batman.connect(addr1).transferFrom(owner.address, addr2.address, amount);
            const supplyAfter = await batman.TotalToken();

            expect(supplyBefore - supplyAfter).to.equal(burnAmount);

            console.log(supplyBefore, " : Supply before")
            console.log(supplyAfter, " : Supply after")

            const bal = await batman.balanceOf(addr2.address);
            console.log(" balance of receiver", bal);
        });

        it("should transfer 1% to the whitelisted address", async () => {
            const amount = 100n;
            const amountwithdecimal = amount * unit;
            const rewardforwhitelist = (amountwithdecimal * 1n) / 100n

            const balancebefore = await batman.balanceOf(addr7.address);
            await batman.connect(addr1).transferFrom(owner.address, addr2.address, amount);
            const balanceafter = await batman.balanceOf(addr7.address);
            expect(balanceafter - balancebefore).to.equal(rewardforwhitelist);

            console.log(balancebefore, " : before");
            console.log(balanceafter, " : after");
            console.log(rewardforwhitelist, " : reward amount")
        });

        it("transfer event should emit while transferFrom", async () => {
            await expect(
                batman.connect(addr1).transferFrom(owner.address, addr2.address, 100n))
                .to.emit(batman, "Transfer");
        });

        it("TranferFrom fails if allowance exceeded", async () => {
            await expect(
                batman.connect(addr1).transferFrom(owner.address, addr2.address, 250n))
                .to.be.revertedWith("Allowance exceeded");
        })

        it("transfer fail without 5 white listed address", async () => {
            const freshBatman = await Batman.deploy();
            await freshBatman.connect(owner).approve(addr1.address, 100n);
            await expect(
                freshBatman.connect(addr1).transferFrom(owner.address, addr6.address, 10n))
                .to.be.revertedWith("Need 5 whitelisted users");
        });

        it(" recipient can't receive full raw amount ", async () => {
            const amount = 100n;
            await batman.connect(addr1).transferFrom(owner.address, addr6.address, amount);
            const balance = await batman.balanceOf(addr6.address);
            expect(balance).to.not.equal(amount * unit);
        });
    })

    //
    // :: Mint ::
    //

    describe("Mint", () => {
        const MINT_AMOUNT = 10n * unit;
        const MINT_LIMIT = 100n * unit;

        it("owner can mint the function", async () => {
            await batman.burn()
            const balbefore = await batman.balanceOf(owner)
            await batman.connect(owner).mint()
            const balafter = await batman.balanceOf(owner)
            expect(balafter - balbefore).to.equal(MINT_AMOUNT)
        });

        it("Mint event should emit when mint", async () => {
            await batman.burn()
            await expect(batman.connect(owner).mint()).to.emit(batman, "Mint")
                .withArgs(owner.address, MINT_AMOUNT)
        });

        it("Transfer event should emit when mint", async () => {
            await batman.burn()
            await expect(batman.connect(owner).mint()).to.emit(batman, "Transfer")
                .withArgs(ethers.ZeroAddress, owner, MINT_AMOUNT)
        });

        it("non owner can't mint", async () => {
            await expect(
                batman.connect(addr1).mint())
                .to.be.revertedWith("only owner have access to this function")
        });

        it("owner can mint up to Mint_Limit", async () => {

            for (let i = 0; i < 11; i++) {
                await batman.connect(owner).burn();
            }

            for (let i = 0; i < 10; i++) {
                await batman.connect(owner).mint();
            }

            await expect(batman.connect(owner).mint())
                .to.be.revertedWith("Maximum limit reached")
        })
    })

    //
    // :: burn :
    //

    describe("Burn", () => {

        const MINT_AMOUNT = 10n * unit;

        it("burn reduces the TotalSupply", async () => {
            const bal1 = await batman.TotalToken()
            await batman.connect(owner).burn()
            const bal2 = await batman.TotalToken()
            expect(bal1 - bal2).to.equal(MINT_AMOUNT)
        });

        it("owner can burn the token", async () => {
            const balBefore = await batman.balanceOf(owner.address);
            await batman.connect(owner).burn();
            const balAfter = await batman.balanceOf(owner.address);
            expect(balBefore - balAfter).to.equal(MINT_AMOUNT);
        })

        it("Transfer to zero address event emit on burn", async () => {
            await expect(batman.connect(owner).burn())
                .to.emit(batman, "Transfer")
                .withArgs(owner.address, ethers.ZeroAddress, MINT_AMOUNT)
        })
        it("non-owner cannot burn", async () => {
            await expect(batman.connect(addr1).burn())
            .to.be.revertedWith("only owner have access to this function");
        });

        it("total supply to change after burn", async () => {
            const supplyBefore = await batman.TotalToken();
            await batman.connect(owner).burn();
            const supplyAfter = await batman.TotalToken();
            expect(supplyAfter).to.not.equal(supplyBefore);
        });
    })
})