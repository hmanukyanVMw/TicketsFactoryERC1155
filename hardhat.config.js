/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require("dotenv").config();

const {PRIVATE_KEY, PRIVATE_KEY_SECONDARY, ETHER_SCAN_TOKEN} = process.env;

module.exports = {
  solidity: "0.8.14",
  defaultNetwork: "localhost",
  paths: {
    artifacts: "./src/artifacts",
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/VQu1SPhPXOGss4gbh_NuIPcRvadikkpo",
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY_SECONDARY}`]
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: ETHER_SCAN_TOKEN
  }
};
