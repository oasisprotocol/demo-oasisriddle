import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@oasisprotocol/sapphire-hardhat';

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    'sapphire': {
      url: 'https://sapphire.oasis.io',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
      chainId: 0x5afe
    },
    'sapphire-testnet': {
      url: 'https://testnet.sapphire.oasis.dev',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
      chainId: 0x5aff
    },
    'sapphire-localnet': {
      url: 'http://localhost:8545',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
      chainId: 0x5afd
    },
  },
};

export default config;
