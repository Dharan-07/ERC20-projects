import "dotenv/config";
import { defineConfig, configVariable } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";
import hardhatEthersChaiMatchers from "@nomicfoundation/hardhat-ethers-chai-matchers";

export default defineConfig({
    plugins: [hardhatEthers, hardhatVerify, hardhatMocha, hardhatEthersChaiMatchers],

    solidity: {
        version: "0.8.27",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },

    paths: {
        tests: "./tests"
    },

    networks: {
        bscTestnet: {
            type: "http",
            url: "https://bsc-testnet.infura.io/v3/a4996f61d8f145c796cdcf1d5242d26a",
            chainId: 97,
            accounts: [process.env.PRIVATE_KEY]
        }
    },
    etherscan: {
        apiKey: {
            bscTestnet: "62DBMTPVU7TH5MAXK56FI51AS22WTBTTC4",
        },
    },

});