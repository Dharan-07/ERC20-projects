import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("Batman Token Contract", () => {
    let batman, Batman;
    let owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7;

    const decimal = 18n;
    const unit = 10n ** decimal;

    // Contract constants
    const TOTAL_SUPPLY = 10000000000n * unit;
    const MINT_AMOUNT = 10n * unit;
    const MINT_LIMIT = 100n * unit;

    // Helper: whitelist 5 addresses
    async function setupWhitelist() {
        await batman.connect(owner).setWhiteList(addr1.address, true);
        await batman.connect(owner).setWhiteList(addr2.address, true);
        await batman.connect(owner).setWhiteList(addr3.address, true);
        await batman.connect(owner).setWhiteList(addr4.address, true);
        await batman.connect(owner).setWhiteList(addr5.address, true);
    }

    beforeEach(async () => {
        Batman = await ethers.getContractFactory("Batman");
        [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] =
            await ethers.getSigners();
        batman = await Batman.deploy();
    });

    // ─────────────────────────────────────────────────────────────
    // 1. DEPLOYMENT
    // ─────────────────────────────────────────────────────────────
    describe("Deployment", () => {
        it("✅ [TRUE] should return correct token name", async () => {
            expect(await batman.name()).to.equal("Batman");
        });

        it("✅ [TRUE] should return correct token symbol", async () => {
            expect(await batman.symbol()).to.equal("BTM");
        });

        it("✅ [TRUE] should return correct decimals", async () => {
            expect(await batman.decimals()).to.equal(18n);
        });

        it("✅ [POSITIVE] should assign 10% of totalSupply to owner on deploy", async () => {
            const ownerBalance = await batman.balanceOf(owner.address);
            const expectedBalance = TOTAL_SUPPLY / 10n;
            expect(ownerBalance).to.equal(expectedBalance);
        });

        it("✅ [POSITIVE] total supply should match constant", async () => {
            expect(await batman.TotalToken()).to.equal(TOTAL_SUPPLY);
        });

        it("❌ [FALSE] owner balance should NOT equal full totalSupply", async () => {
            const ownerBalance = await batman.balanceOf(owner.address);
            expect(ownerBalance).to.not.equal(TOTAL_SUPPLY);
        });

        it("❌ [FALSE] non-owner should have zero balance initially", async () => {
            const bal = await batman.balanceOf(addr1.address);
            expect(bal).to.equal(0n);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 2. WHITELIST MANAGEMENT
    // ─────────────────────────────────────────────────────────────
    describe("Whitelist Management", () => {
        it("✅ [POSITIVE] owner can add users to whitelist", async () => {
            await batman.connect(owner).setWhiteList(addr1.address, true);
            const list = await batman.getwhitelistedaddress();
            expect(list).to.include(addr1.address);
        });

        it("✅ [POSITIVE] whitelist should hold up to 5 users", async () => {
            await setupWhitelist();
            const list = await batman.getwhitelistedaddress();
            expect(list.length).to.equal(5);
        });

        it("✅ [POSITIVE] owner can remove a user from whitelist", async () => {
            await batman.connect(owner).setWhiteList(addr1.address, true);
            await batman.connect(owner).removeFromWhiteList(addr1.address);
            const list = await batman.getwhitelistedaddress();
            expect(list).to.not.include(addr1.address);
        });

        it("✅ [TRUE] WhiteListUpdate event emitted on add", async () => {
            await expect(batman.connect(owner).setWhiteList(addr1.address, true))
                .to.emit(batman, "WhiteListUpdate")
                .withArgs(addr1.address, true);
        });

        it("✅ [TRUE] WhiteListUpdate event emitted on remove", async () => {
            await batman.connect(owner).setWhiteList(addr1.address, true);
            await expect(batman.connect(owner).removeFromWhiteList(addr1.address))
                .to.emit(batman, "WhiteListUpdate")
                .withArgs(addr1.address, false);
        });

        it("❌ [NEGATIVE] non-owner cannot add to whitelist", async () => {
            await expect(
                batman.connect(addr1).setWhiteList(addr2.address, true)
            ).to.be.revertedWith("only owner have access to this function");
        });

        it("❌ [NEGATIVE] cannot add zero address to whitelist", async () => {
            await expect(
                batman.connect(owner).setWhiteList(ethers.ZeroAddress, true)
            ).to.be.revertedWith("invalid address");
        });

        it("❌ [NEGATIVE] whitelist cannot exceed 5 users", async () => {
            await setupWhitelist();
            await expect(
                batman.connect(owner).setWhiteList(addr6.address, true)
            ).to.be.revertedWith("Whitelist full");
        });

        it("❌ [NEGATIVE] cannot remove a non-whitelisted address", async () => {
            await expect(
                batman.connect(owner).removeFromWhiteList(addr1.address)
            ).to.be.revertedWith("User not WhiteListed");
        });

        it("❌ [NEGATIVE] non-owner cannot remove from whitelist", async () => {
            await batman.connect(owner).setWhiteList(addr1.address, true);
            await expect(
                batman.connect(addr2).removeFromWhiteList(addr1.address)
            ).to.be.revertedWith("only owner have access to this function");
        });

        it("❌ [FALSE] removed user should not appear in whitelist array", async () => {
            await batman.connect(owner).setWhiteList(addr1.address, true);
            await batman.connect(owner).removeFromWhiteList(addr1.address);
            const list = await batman.getwhitelistedaddress();
            expect(list).to.not.include(addr1.address);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 3. TRANSFER
    // ─────────────────────────────────────────────────────────────
    describe("Transfer", () => {
        beforeEach(async () => {
            await setupWhitelist();
        });

        it("✅ [POSITIVE] owner can transfer tokens after whitelist setup", async () => {
            const amount = 100n; // raw amount (contract multiplies by decimals)
            const amountWithDecimals = amount * unit;

            const burnTax = (amountWithDecimals * 3n) / 100n;
            const whitelistRewardEach = (amountWithDecimals * 1n) / 100n;
            const totalDeduction = burnTax + whitelistRewardEach * 5n;
            const expectedReceived = amountWithDecimals - totalDeduction;

            await batman.connect(owner).transfer(addr6.address, amount);

            expect(await batman.balanceOf(addr6.address)).to.equal(expectedReceived);
        });

        it("✅ [POSITIVE] whitelisted users receive 1% reward each on transfer", async () => {
            const amount = 1000n;
            const amountWithDecimals = amount * unit;
            const reward = (amountWithDecimals * 1n) / 100n;

            const before = await batman.balanceOf(addr1.address);
            await batman.connect(owner).transfer(addr6.address, amount);
            const after = await batman.balanceOf(addr1.address);

            expect(after - before).to.equal(reward);
        });

        it("✅ [POSITIVE] 3% burn reduces totalSupply", async () => {
            const amount = 100n;
            const amountWithDecimals = amount * unit;
            const burnAmount = (amountWithDecimals * 3n) / 100n;

            const supplyBefore = await batman.TotalToken();
            await batman.connect(owner).transfer(addr6.address, amount);
            const supplyAfter = await batman.TotalToken();

            expect(supplyBefore - supplyAfter).to.equal(burnAmount);
        });

        it("✅ [TRUE] Transfer event emitted on successful transfer", async () => {
            await expect(batman.connect(owner).transfer(addr6.address, 100n)).to.emit(
                batman,
                "Transfer"
            );
        });

        it("❌ [NEGATIVE] transfer fails with insufficient balance", async () => {
            await expect(
                batman.connect(addr6).transfer(addr7.address, 100n)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("❌ [NEGATIVE] transfer fails to zero address", async () => {
            await expect(
                batman.connect(owner).transfer(ethers.ZeroAddress, 10n)
            ).to.be.revertedWith("Cannot transfer to zero address");
        });

        it("❌ [NEGATIVE] transfer fails if fewer than 5 whitelisted users", async () => {
            // Deploy a fresh contract with no whitelisted users
            const freshBatman = await Batman.deploy();
            await expect(
                freshBatman.connect(owner).transfer(addr6.address, 10n)
            ).to.be.revertedWith("Need 5 whitelisted users");
        });

        it("❌ [FALSE] recipient should NOT receive the full raw amount (tax applies)", async () => {
            const amount = 100n;
            await batman.connect(owner).transfer(addr6.address, amount);
            const balance = await batman.balanceOf(addr6.address);
            expect(balance).to.not.equal(amount * unit);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 4. APPROVE & ALLOWANCE
    // ─────────────────────────────────────────────────────────────
    describe("Approve & Allowance", () => {
        it("✅ [POSITIVE] owner can approve spender", async () => {
            await batman.connect(owner).approve(addr1.address, 500n);
            const allowed = await batman.allowance(owner.address, addr1.address);
            expect(allowed).to.equal(500n * unit);
        });

        it("✅ [TRUE] Approval event emitted on approve", async () => {
            await expect(batman.connect(owner).approve(addr1.address, 200n))
                .to.emit(batman, "Approval")
                .withArgs(owner.address, addr1.address, 200n * unit);
        });

        it("❌ [NEGATIVE] cannot approve zero address", async () => {
            await expect(
                batman.connect(owner).approve(ethers.ZeroAddress, 100n)
            ).to.be.revertedWith("Cannot approve amount to a zero address");
        });

        it("❌ [FALSE] allowance should be zero before any approval", async () => {
            const allowed = await batman.allowance(owner.address, addr1.address);
            expect(allowed).to.equal(0n);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 5. INCREASE & DECREASE ALLOWANCE
    // ─────────────────────────────────────────────────────────────
    describe("increaseAllowance & decreaseAllowance", () => {
        it("✅ [POSITIVE] can increase allowance", async () => {
            await batman.connect(owner).approve(addr1.address, 100n);
            await batman.connect(owner).increaseAllowance(addr1.address, 50n);
            const allowed = await batman.allowance(owner.address, addr1.address);
            expect(allowed).to.equal(150n * unit);
        });

        it("✅ [POSITIVE] can decrease allowance", async () => {
            await batman.connect(owner).approve(addr1.address, 100n);
            await batman.connect(owner).decreaseAllowance(addr1.address, 40n);
            const allowed = await batman.allowance(owner.address, addr1.address);
            expect(allowed).to.equal(60n * unit);
        });

        it("✅ [TRUE] Approval event emitted on increaseAllowance", async () => {
            await batman.connect(owner).approve(addr1.address, 100n);
            await expect(
                batman.connect(owner).increaseAllowance(addr1.address, 50n)
            ).to.emit(batman, "Approval");
        });

        it("❌ [NEGATIVE] cannot increase allowance for zero address", async () => {
            await expect(
                batman.connect(owner).increaseAllowance(ethers.ZeroAddress, 50n)
            ).to.be.revertedWith("Cannot increase allowance to address value Zero");
        });

        it("❌ [NEGATIVE] cannot decrease allowance for zero address", async () => {
            await expect(
                batman.connect(owner).decreaseAllowance(ethers.ZeroAddress, 50n)
            ).to.be.revertedWith("cannot decrease allowance to address value Zero");
        });

        it("❌ [NEGATIVE] cannot decrease allowance below zero", async () => {
            await batman.connect(owner).approve(addr1.address, 10n);
            await expect(
                batman.connect(owner).decreaseAllowance(addr1.address, 50n)
            ).to.be.revertedWith("Insufficient allowance balance to decrease");
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 6. TRANSFER FROM
    // ─────────────────────────────────────────────────────────────
    describe("transferFrom", () => {
        beforeEach(async () => {
            await setupWhitelist();
            // Give addr6 some tokens via mint + direct send from owner
            await batman.connect(owner).approve(addr1.address, 200n);
        });

        it("✅ [POSITIVE] spender can transferFrom within allowance", async () => {
            const amount = 100n;
            const amountWithDecimals = amount * unit;
            const burnTax = (amountWithDecimals * 3n) / 100n;
            const whitelistRewardEach = (amountWithDecimals * 1n) / 100n;
            const totalDeduction = burnTax + whitelistRewardEach * 5n;
            const expectedReceived = amountWithDecimals - totalDeduction;

            await batman.connect(addr1).transferFrom(owner.address, addr6.address, amount);
            expect(await batman.balanceOf(addr6.address)).to.equal(expectedReceived);
        });

        it("✅ [POSITIVE] allowance is reduced after transferFrom", async () => {
            await batman.connect(addr1).transferFrom(owner.address, addr6.address, 100n);
            const remaining = await batman.allowance(owner.address, addr1.address);
            expect(remaining).to.equal(100n * unit);
        });

        it("✅ [POSITIVE] 3% burn reduces totalSupply on transferFrom", async () => {
            const amount = 100n;
            const amountWithDecimals = amount * unit;
            const burnAmount = (amountWithDecimals * 3n) / 100n;

            const supplyBefore = await batman.TotalToken();
            await batman.connect(addr1).transferFrom(owner.address, addr6.address, amount);
            const supplyAfter = await batman.TotalToken();

            expect(supplyBefore - supplyAfter).to.equal(burnAmount);
        });

        it("✅ [TRUE] Transfer event emitted on transferFrom", async () => {
            await expect(
                batman.connect(addr1).transferFrom(owner.address, addr6.address, 100n)
            ).to.emit(batman, "Transfer");
        });

        it("❌ [NEGATIVE] transferFrom fails if allowance exceeded", async () => {
            await expect(
                batman.connect(addr1).transferFrom(owner.address, addr6.address, 500n)
            ).to.be.revertedWith("Allowance exceeded");
        });

        it("❌ [NEGATIVE] transferFrom fails to zero address", async () => {
            await expect(
                batman.connect(addr1).transferFrom(owner.address, ethers.ZeroAddress, 10n)
            ).to.be.revertedWith("Cannot transfer to zero address");
        });

        it("❌ [NEGATIVE] transferFrom fails without 5 whitelisted users", async () => {
            const freshBatman = await Batman.deploy();
            await freshBatman.connect(owner).approve(addr1.address, 100n);
            await expect(
                freshBatman.connect(addr1).transferFrom(owner.address, addr6.address, 10n)
            ).to.be.revertedWith("Need 5 whitelisted users");
        });

        it("❌ [NEGATIVE] transferFrom fails with insufficient balance", async () => {
            // addr6 has no balance, addr2 has allowance for addr6
            await batman.connect(addr6).approve(addr2.address, 100n);
            await expect(
                batman.connect(addr2).transferFrom(addr6.address, addr7.address, 10n)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("❌ [FALSE] recipient should NOT receive full raw amount (tax deducted)", async () => {
            const amount = 100n;
            await batman.connect(addr1).transferFrom(owner.address, addr6.address, amount);
            const balance = await batman.balanceOf(addr6.address);
            expect(balance).to.not.equal(amount * unit);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 7. MINT
    // ─────────────────────────────────────────────────────────────
    describe("Mint", () => {
        it("✅ [POSITIVE] owner can mint tokens", async () => {
            const balBefore = await batman.balanceOf(owner.address);
            await batman.connect(owner).mint();
            const balAfter = await batman.balanceOf(owner.address);
            expect(balAfter - balBefore).to.equal(MINT_AMOUNT);
        });

        it("✅ [TRUE] Mint event emitted on mint", async () => {
            await expect(batman.connect(owner).mint())
                .to.emit(batman, "Mint")
                .withArgs(owner.address, MINT_AMOUNT);
        });

        it("✅ [TRUE] Transfer event from zero address emitted on mint", async () => {
            await expect(batman.connect(owner).mint())
                .to.emit(batman, "Transfer")
                .withArgs(ethers.ZeroAddress, owner.address, MINT_AMOUNT);
        });

        it("✅ [POSITIVE] owner can mint up to Mint_Limit (100 tokens)", async () => {
            // Mint_Limit = 100 tokens = 10 mints of 10 tokens each
            for (let i = 0; i < 10; i++) {
                await batman.connect(owner).mint();
            }
            // 11th mint should fail
            await expect(batman.connect(owner).mint()).to.be.revertedWith(
                "Maximum limit reached"
            );
        });

        it("❌ [NEGATIVE] non-owner cannot mint", async () => {
            await expect(batman.connect(addr1).mint()).to.be.revertedWith(
                "only owner have access to this function"
            );
        });

        it("❌ [NEGATIVE] mint fails when per-user limit exceeded", async () => {
            for (let i = 0; i < 10; i++) {
                await batman.connect(owner).mint();
            }
            await expect(batman.connect(owner).mint()).to.be.revertedWith(
                "Maximum limit reached"
            );
        });

        it("❌ [FALSE] minting should NOT happen without onlyOwner passing", async () => {
            await expect(batman.connect(addr2).mint()).to.be.reverted;
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 8. BURN
    // ─────────────────────────────────────────────────────────────
    describe("Burn", () => {
        it("✅ [POSITIVE] owner can burn tokens", async () => {
            const balBefore = await batman.balanceOf(owner.address);
            await batman.connect(owner).burn();
            const balAfter = await batman.balanceOf(owner.address);
            expect(balBefore - balAfter).to.equal(MINT_AMOUNT);
        });

        it("✅ [POSITIVE] burn reduces totalSupply", async () => {
            const supplyBefore = await batman.TotalToken();
            await batman.connect(owner).burn();
            const supplyAfter = await batman.TotalToken();
            expect(supplyBefore - supplyAfter).to.equal(MINT_AMOUNT);
        });

        it("✅ [TRUE] Transfer to zero address event emitted on burn", async () => {
            await expect(batman.connect(owner).burn())
                .to.emit(batman, "Transfer")
                .withArgs(owner.address, ethers.ZeroAddress, MINT_AMOUNT);
        });

        it("❌ [NEGATIVE] non-owner cannot burn", async () => {
            await expect(batman.connect(addr1).burn()).to.be.revertedWith(
                "only owner have access to this function"
            );
        });

        it("❌ [NEGATIVE] burn fails if owner has insufficient balance", async () => {
            // Drain owner's balance by burning repeatedly
            const ownerBal = await batman.balanceOf(owner.address);
            const burnCount = ownerBal / MINT_AMOUNT;
            for (let i = 0; i < burnCount; i++) {
                await batman.connect(owner).burn();
            }
            await expect(batman.connect(owner).burn()).to.be.revertedWith(
                "Insufficient balance to burn"
            );
        });

        it("❌ [FALSE] totalSupply should NOT stay the same after burn", async () => {
            const supplyBefore = await batman.TotalToken();
            await batman.connect(owner).burn();
            const supplyAfter = await batman.TotalToken();
            expect(supplyAfter).to.not.equal(supplyBefore);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 9. COMBINED / EDGE CASE SCENARIOS
    // ─────────────────────────────────────────────────────────────
    describe("Edge Cases & Combined Scenarios", () => {
        it("✅ [POSITIVE] whitelist reward goes to correct 5 addresses", async () => {
            await setupWhitelist();
            const wlAddresses = [
                addr1.address,
                addr2.address,
                addr3.address,
                addr4.address,
                addr5.address,
            ];
            const amount = 1000n;
            const amountWithDecimals = amount * unit;
            const expectedReward = (amountWithDecimals * 1n) / 100n;

            const beforeBalances = await Promise.all(
                wlAddresses.map((a) => batman.balanceOf(a))
            );
            await batman.connect(owner).transfer(addr6.address, amount);
            const afterBalances = await Promise.all(
                wlAddresses.map((a) => batman.balanceOf(a))
            );

            for (let i = 0; i < 5; i++) {
                expect(afterBalances[i] - beforeBalances[i]).to.equal(expectedReward);
            }
        });

        it("✅ [POSITIVE] transfer works after re-adding removed whitelisted user", async () => {
            await setupWhitelist();
            await batman.connect(owner).removeFromWhiteList(addr5.address);
            await batman.connect(owner).setWhiteList(addr6.address, true);
            // Now 5 whitelisted: addr1–addr4 + addr6
            await expect(
                batman.connect(owner).transfer(addr7.address, 10n)
            ).to.not.be.reverted;
        });

        it("✅ [POSITIVE] getwhitelistedaddress returns all 5 after setup", async () => {
            await setupWhitelist();
            const list = await batman.getwhitelistedaddress();
            expect(list.length).to.equal(5);
        });

        it("❌ [NEGATIVE] transfer fails after dropping below 5 whitelisted users", async () => {
            await setupWhitelist();
            await batman.connect(owner).removeFromWhiteList(addr5.address);
            await expect(
                batman.connect(owner).transfer(addr6.address, 10n)
            ).to.be.revertedWith("Need 5 whitelisted users");
        });

        it("✅ [TRUE] approve then transferFrom full cycle works correctly", async () => {
            await setupWhitelist();
            await batman.connect(owner).approve(addr1.address, 100n);
            const allowed = await batman.allowance(owner.address, addr1.address);
            expect(allowed).to.equal(100n * unit);

            await batman.connect(addr1).transferFrom(owner.address, addr6.address, 50n);
            const remainingAllowance = await batman.allowance(owner.address, addr1.address);
            expect(remainingAllowance).to.equal(50n * unit);
        });

        it("✅ [POSITIVE] mint then burn returns owner balance to original", async () => {
            const balBefore = await batman.balanceOf(owner.address);
            await batman.connect(owner).mint();
            await batman.connect(owner).burn();
            const balAfter = await batman.balanceOf(owner.address);
            expect(balAfter).to.equal(balBefore);
        });

        it("❌ [FALSE] totalSupply should NOT increase after burn (only decreases)", async () => {
            const supplyBefore = await batman.TotalToken();
            await batman.connect(owner).burn();
            const supplyAfter = await batman.TotalToken();
            expect(supplyAfter).to.be.lessThan(supplyBefore);
        });
    });
});