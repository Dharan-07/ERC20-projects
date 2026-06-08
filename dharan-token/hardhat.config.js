import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import("solidity-coverage");

export default {
  solidity: "0.8.30",

  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [
        process.env.ACC1_PRIVATE_KEY,
        process.env.ACC2_PRIVATE_KEY,
        process.env.ACC3_PRIVATE_KEY,
      ],
    },
  },
  etherscan: {
    apiKey: 
      "Q2KZYU48DMYMX1WJI156PWUWHQ1EWF14RC",
  },
};