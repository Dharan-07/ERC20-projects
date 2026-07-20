// import hre from "hardhat";

// async function main() {

//     const contractAddress = "0x4a9B01F369914A26D407a3dFDc897f3aBc42717A";

//     const ico = await hre.ethers.getContractAt(
//         "ASD_ICO",
//         contractAddress
//     );

//     // Buyer (msg.sender)
//     const [buyer] = await hre.ethers.getSigners();

//     console.log("Buyer:", buyer.address);

//     // Signer wallet (the address stored as `signer` in the ICO contract)
//     const signerWallet = new hre.ethers.Wallet(
//         process.env.SIGNER_PRIVATE_KEY,
//         hre.ethers.provider
//     );

//     console.log("Signer:", signerWallet.address);

//     const paymentType = 1; // 0 = BNB, 1 = USDT
//     const recipient = "0x4A8354a8a1373fA4281CE9DeEa46eD9a774077F1";
//     const caller = buyer.address;
//     const tokenAmount = 1000000n; // 100 USDT
//     const nonce = 3;

//     console.log("paymentType : ", paymentType);
//     console.log("recipient : ", recipient);
//     console.log("caller : ", caller);
//     console.log("tokenAmount : ", tokenAmount);
//     console.log("nonce : ", nonce);

//     // Generate hash
//     const hash = hre.ethers.solidityPackedKeccak256(
//         ["uint256", "address", "address", "uint256", "uint256"],
//         [
//             paymentType,
//             recipient,
//             caller,
//             tokenAmount,
//             nonce
//         ]
//     );

//     console.log("Hash:", hash);

//     // Generate signature
//     const signature = await signerWallet.signMessage(
//         hre.ethers.getBytes(hash)
//     );

//     const sig = hre.ethers.Signature.from(signature);

//     console.log("\n=== Signature ===");
//     console.log("v:", sig.v);
//     console.log("r:", sig.r);
//     console.log("s:", sig.s);


//     const payment = await ico.paymentDetails(1);
//     console.log(payment);

//     const usdt = await hre.ethers.getContractAt(
//         "IERC20",
//         payment.paymentTokenAddress
//     );

//     const balance = await usdt.balanceOf(buyer.address);
//     console.log("USDT Balance:", balance.toString());

//     const allowance = await usdt.allowance(
//         buyer.address,
//         contractAddress
//     );
//     console.log("Allowance:", allowance.toString());

//     const icoToken = await ico.tokenAddress();
//     console.log("ICO Token:", icoToken);

//     const saleToken = await hre.ethers.getContractAt(
//         "IERC20",
//         icoToken
//     );

//     const icoBalance = await saleToken.balanceOf(contractAddress);
//     console.log("ICO Token Balance:", icoBalance.toString());

//     const tokensToReceive = await ico.getToken(paymentType, tokenAmount);

//     console.log(
//         "Tokens to receive:",
//         hre.ethers.formatUnits(tokensToReceive, 18)
//     );

//     // ===================== Calculation Details =====================

//     const latestPrice = await ico.getLatestPrice(paymentType);

//     console.log("\n========== Calculation ==========");
//     console.log("Payment Type        :", paymentType);
//     console.log("Payment Amount Raw  :", tokenAmount.toString());
//     console.log(
//         "Payment Amount      :",
//         hre.ethers.formatUnits(tokenAmount, payment.decimal),
//         payment.paymentName
//     );

//     console.log(
//         "Oracle Price (raw)  :",
//         latestPrice.toString()
//     );

//     console.log(
//         "Oracle Price (USD)  :",
//         Number(latestPrice) / 1e8
//     );

//     const tokenPerUSD = await ico.tokenAmountPerUSD();

//     console.log(
//         "Token Per USD (raw) :",
//         tokenPerUSD.toString()
//     );

//     console.log(
//         "Token Per USD       :",
//         hre.ethers.formatUnits(tokenPerUSD, 18)
//     );

//     // amount = price * tokenAmountPerUSD / 1e8
//     const amountPerPaymentToken =
//         latestPrice * tokenPerUSD / 100000000n;

//     console.log(
//         "Amount (raw)        :",
//         amountPerPaymentToken.toString()
//     );

//     console.log(
//         "Amount              :",
//         hre.ethers.formatUnits(amountPerPaymentToken, 18)
//     );

//     // data = amount * tokenAmount / 10**paymentDecimals
//     const calculated =
//         amountPerPaymentToken *
//         tokenAmount /
//         (10n ** BigInt(payment.decimal));

//     console.log(
//         "Calculated (raw)    :",
//         calculated.toString()
//     );

//     console.log(
//         "Calculated Tokens   :",
//         hre.ethers.formatUnits(calculated, 18)
//     );

//     const contractValue = await ico.getToken(paymentType, tokenAmount);

//     console.log(
//         "Contract getToken() :",
//         hre.ethers.formatUnits(contractValue, 18)
//     );

//     console.log("=================================\n");

//     // Buy token
//     const tx = await ico.connect(buyer).buyToken(
//         recipient,
//         paymentType,
//         tokenAmount,
//         {
//             v: sig.v,
//             r: sig.r,
//             s: sig.s,
//             nonce: nonce
//         }
//     );

//     console.log("\nTransaction Hash:", tx.hash);

//     const receipt = await tx.wait();

//     console.log("\n=== Transaction Receipt ===");
//     console.log("Block Number:", receipt.blockNumber);
//     console.log("Gas Used:", receipt.gasUsed.toString());
//     console.log("Status:", receipt.status);

//     console.log("\n--Done--");
// }

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });









// import hre from "hardhat";

// async function main() {
//     const contractAddress = "0x4a9B01F369914A26D407a3dFDc897f3aBc42717A";

//     const ico = await hre.ethers.getContractAt(
//         "ASD_ICO",
//         contractAddress
//     );

//     const [buyer] = await hre.ethers.getSigners();

//     const signerWallet = new hre.ethers.Wallet(
//         process.env.SIGNER_PRIVATE_KEY,
//         hre.ethers.provider
//     );

//     const paymentType = 0;
//     const recipient = "0x4A8354a8a1373fA4281CE9DeEa46eD9a774077F1";
//     // Buying with 0.01 tBNB
//     const bnbAmount = hre.ethers.parseEther("0.00001");
//     const nonce = 4;
//     console.log("Buyer:", buyer.address);
//     console.log("BNB:", hre.ethers.formatEther(bnbAmount));

//     const hash = hre.ethers.solidityPackedKeccak256(
//         ["uint256", "address", "address", "uint256", "uint256"],
//         [
//             paymentType,
//             recipient,
//             buyer.address,
//             bnbAmount,
//             nonce
//         ]
//     );

//     console.log("Hash:", hash);

//     const signature = await signerWallet.signMessage(
//         hre.ethers.getBytes(hash)
//     );

//     const sig = hre.ethers.Signature.from(signature);

//     console.log(sig);

//     const tokens = await ico.getToken(
//         paymentType,
//         bnbAmount
//     );

//     console.log(
//         "Tokens to receive:",
//         hre.ethers.formatUnits(tokens, 18)
//     );

//     console.log("Value (wei):", bnbAmount.toString());
//     console.log("Value (BNB):", hre.ethers.formatEther(bnbAmount));


//     // ===================== Calculation Details =====================

//     const payment = await ico.paymentDetails(paymentType);

//     const latestPrice = await ico.getLatestPrice(paymentType);

//     console.log("\n========== BNB Calculation ==========");

//     console.log("Payment Type         :", paymentType);
//     console.log("Payment Name         :", payment.paymentName);

//     console.log("BNB Amount (wei)     :", bnbAmount.toString());
//     console.log("BNB Amount           :", hre.ethers.formatEther(bnbAmount));

//     console.log("Oracle Price (raw)   :", latestPrice.toString());
//     console.log(
//         "Oracle Price (USD)   :",
//         Number(latestPrice) / 1e8
//     );

//     const tokenPerUSD = await ico.tokenAmountPerUSD();

//     console.log("Token/USD (raw)      :", tokenPerUSD.toString());
//     console.log(
//         "Token/USD            :",
//         hre.ethers.formatUnits(tokenPerUSD, 18)
//     );

//     // amount = price * tokenAmountPerUSD / 1e8
//     const amount =
//         latestPrice * tokenPerUSD / 100000000n;

//     console.log("Amount (raw)         :", amount.toString());
//     console.log(
//         "Amount               :",
//         hre.ethers.formatUnits(amount, 18)
//     );

//     // data = amount * bnbAmount / 10^18
//     const calculated =
//         amount * bnbAmount /
//         (10n ** BigInt(payment.decimal));

//     console.log("Calculated (raw)     :", calculated.toString());
//     console.log(
//         "Calculated Tokens    :",
//         hre.ethers.formatUnits(calculated, 18)
//     );

//     const contractTokens = await ico.getToken(
//         paymentType,
//         bnbAmount
//     );

//     console.log(
//         "Contract getToken()  :",
//         hre.ethers.formatUnits(contractTokens, 18)
//     );

//     console.log("=====================================\n");

//     const tx = await ico.buyToken(
//         recipient,
//         paymentType,
//         0,
//         {
//             v: sig.v,
//             r: sig.r,
//             s: sig.s,
//             nonce: nonce
//         },
//         {
//             value: bnbAmount
//         }
//     );

//     console.log("Tx:", tx.hash);

//     await tx.wait();

//     console.log("Success");
// }

// main().catch(console.error);




import hre from "hardhat";

async function main() {
    const contractAddress = "0x4a9B01F369914A26D407a3dFDc897f3aBc42717A";

    const ico = await hre.ethers.getContractAt(
        "ASD_ICO",
        contractAddress
    );

    const [buyer] = await hre.ethers.getSigners();

    const signerWallet = new hre.ethers.Wallet(
        process.env.SIGNER_PRIVATE_KEY,
        hre.ethers.provider
    );

    //----------------------------------------------------
    // CHANGE ONLY THIS
    //----------------------------------------------------
    const paymentType = 0; // 0 = BNB, 1 = USDT

    //----------------------------------------------------

    const recipient = "0x4A8354a8a1373fA4281CE9DeEa46eD9a774077F1";

    // Test values
    const bnbAmount = hre.ethers.parseEther("0.0001");
    const usdtAmount = 1000000n;

    const nonce = 16;

    console.log("\n========================================");
    console.log("Buyer:", buyer.address);
    console.log("Recipient:", recipient);
    console.log("Payment Type:", paymentType == 0 ? "BNB" : "USDT");
    console.log("BNB Amount:", hre.ethers.formatEther(bnbAmount));
    console.log("USDT Amount:", usdtAmount.toString());
    console.log("Nonce:", nonce);
    console.log("========================================\n");

    //---------------------------------------------
    // Amount used for signature
    //---------------------------------------------
    const signedAmount =
        paymentType == 0 ? bnbAmount : usdtAmount;

    console.log("Amount used in Signature:", signedAmount.toString());

    //---------------------------------------------
    // Generate Signature
    //---------------------------------------------
    const hash = hre.ethers.solidityPackedKeccak256(
        ["uint256", "address", "address", "uint256", "uint256"],
        [
            paymentType,
            recipient,
            buyer.address,
            signedAmount,
            nonce
        ]
    );

    console.log("Hash:", hash);

    const signature = await signerWallet.signMessage(
        hre.ethers.getBytes(hash)
    );

    const sig = hre.ethers.Signature.from(signature);

    console.log("\nSignature");
    console.log("v:", sig.v);
    console.log("r:", sig.r);
    console.log("s:", sig.s);

    //---------------------------------------------
    // Payment Details
    //---------------------------------------------
    const payment = await ico.paymentDetails(paymentType);

    console.log("\n========== Payment Details ==========");
    console.log("Payment Name :", payment.paymentName);
    console.log("Decimals     :", payment.decimal.toString());
    console.log("Status       :", payment.status);

    if (payment.paymentTokenAddress != hre.ethers.ZeroAddress) {
        console.log("Token Address:", payment.paymentTokenAddress);
    }

    //---------------------------------------------
    // Price
    //---------------------------------------------
    const latestPrice = await ico.getLatestPrice(paymentType);

    console.log("\nOracle Price Raw :", latestPrice.toString());
    console.log(
        "Oracle Price:",
        Number(latestPrice) / 1e8
    );

    const tokenPerUSD = await ico.tokenAmountPerUSD();

    console.log(
        "Token Per USD:",
        hre.ethers.formatUnits(tokenPerUSD, 18)
    );

    //---------------------------------------------
    // Expected Tokens
    //---------------------------------------------
    const expectedTokens = await ico.getToken(
        paymentType,
        signedAmount
    );

    console.log(
        "\nExpected Tokens:",
        hre.ethers.formatUnits(expectedTokens, 18)
    );

    //---------------------------------------------
    // Buyer Balances BEFORE
    //---------------------------------------------
    console.log("\n========== Balances Before ==========");

    const buyerBNB = await hre.ethers.provider.getBalance(
        buyer.address
    );

    console.log(
        "Buyer BNB:",
        hre.ethers.formatEther(buyerBNB)
    );

    let usdt;

    if (payment.paymentTokenAddress != hre.ethers.ZeroAddress) {
        usdt = await hre.ethers.getContractAt(
            "IERC20",
            payment.paymentTokenAddress
        );

        const balance = await usdt.balanceOf(
            buyer.address
        );

        console.log("Buyer USDT:", balance.toString());

        const allowance = await usdt.allowance(
            buyer.address,
            contractAddress
        );

        console.log("Allowance:", allowance.toString());
    }

    //---------------------------------------------
    // ICO Balance
    //---------------------------------------------
    const saleToken = await hre.ethers.getContractAt(
        "IERC20",
        await ico.tokenAddress()
    );

    const icoBalance = await saleToken.balanceOf(
        contractAddress
    );

    console.log(
        "ICO Token Balance:",
        hre.ethers.formatUnits(icoBalance, 18)
    );

    //---------------------------------------------
    // What will happen?
    //---------------------------------------------
    console.log("\n========== Expected Behaviour ==========");

    if (paymentType == 0) {
        console.log("✔ Contract uses msg.value");
        console.log("✔ tokenAmount is ignored");
        console.log("✔ No USDT transfer");
        console.log("✔ BNB will be deducted");
    } else {
        console.log("✔ Contract uses tokenAmount");
        console.log("✔ USDT transferFrom()");
        console.log("✔ msg.value ignored");
        console.log("✔ If BNB is sent, contract keeps it");
    }

    //---------------------------------------------
    // Buy
    //---------------------------------------------
    console.log("\n========== Sending Transaction ==========");

    const tx = await ico.buyToken(
        recipient,
        paymentType,
        usdtAmount, // ignored when paymentType == 0
        {
            v: sig.v,
            r: sig.r,
            s: sig.s,
            nonce
        },
        {
            value: bnbAmount // ignored when paymentType == 1
        }
    );

    console.log("Tx Hash:", tx.hash);

    const receipt = await tx.wait();

    console.log("\n========== Receipt ==========");
    console.log("Status:", receipt.status);
    console.log("Block:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());

    //---------------------------------------------
    // Buyer Balances AFTER
    //---------------------------------------------
    console.log("\n========== Balances After ==========");

    const buyerBNBAfter =
        await hre.ethers.provider.getBalance(
            buyer.address
        );

    console.log(
        "Buyer BNB:",
        hre.ethers.formatEther(buyerBNBAfter)
    );

    if (usdt) {
        const usdtAfter = await usdt.balanceOf(
            buyer.address
        );

        console.log(
            "Buyer USDT:",
            usdtAfter.toString()
        );
    }

    const icoBalanceAfter =
        await saleToken.balanceOf(contractAddress);

    console.log(
        "ICO Token Balance:",
        hre.ethers.formatUnits(icoBalanceAfter, 18)
    );

    console.log("\n============== DONE ==============");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});