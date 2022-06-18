import hre from 'hardhat';
import fs from 'fs';
import dotenv from 'dotenv';
import process from "process";

dotenv.config();

(async () => {
  try {
      const ArmenianLeagueTickets = await hre.ethers.getContractFactory("ArmenianLeagueTickets");

      // const MyUSDToken = await hre.ethers.getContractFactory("MyUSDToken");
      // const myUSDToken = await MyUSDToken.deploy(); //uncomment when need to update MyUSDToken contract
      // const TokenOfUSDToken = "0x9639FC02d13E9AfC67177aC78424628cfFFDa9e8";
      // const armenianLeagueTickets = await ArmenianLeagueTickets.deploy(TokenOfUSDToken);
      const armenianLeagueTickets = await ArmenianLeagueTickets.deploy();

    console.log("address is: ", armenianLeagueTickets.address);
    await armenianLeagueTickets.deployed();


    const dataArmenianLeagueTicketsFactory = {
      address: armenianLeagueTickets.address,
      abi: JSON.parse(armenianLeagueTickets.interface.format('json'))
    };
    fs.writeFileSync('./src/ArmenianLeagueTicketsFactory.deployed-dev.json',
      JSON.stringify(dataArmenianLeagueTicketsFactory));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

