import hre from 'hardhat';
import fs from 'fs';
import dotenv from 'dotenv';
import process from "process";
import myUSDToken from "../src/myUSDToken.deployed.json" assert {type: "json"}; //use onle node version >16.4

dotenv.config();
const basePath = process.cwd();


(async () => {
  try {
    await fs.readFile(`${basePath}/ipfs1155Url.txt`, 'utf8', async (err, baseURLLeague) => {
      if (err) {
        console.error(err);
        return;
      }

      const Tickets = await hre.ethers.getContractFactory("ArmenianLeagueTickets");
      const tickets = await Tickets.deploy(myUSDToken.address);
      await tickets.deployed();

      const dataTicketsFactory = {
        address: tickets.address,
        baseUrl: baseURLLeague,
        abi: JSON.parse(tickets.interface.format('json'))
      };
      fs.writeFileSync('./src/ArmenianLeagueTicketsFactory.deployed.json',
        JSON.stringify(dataTicketsFactory));

      console.log("ArmenianLeagueTicketsFactory deployed to:", dataTicketsFactory.address);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

