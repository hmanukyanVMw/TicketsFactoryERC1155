import { exec } from 'child_process';
import Tickets from "../src/ArmenianLeagueTicketsFactory.deployed.json" assert {type: "json"}; //use onle node version >16.4
import Token from "../src/myUSDToken.deployed.json" assert {type: "json"}; //use onle node version >16.4

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    const {address} = Tickets;

    exec(`npx hardhat verify ${address} "${Token.address}" --network rinkeby`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function main() {
  // "publish": "npx hardhat verify 0xcA92eE8A60908148670a206343AD225a850f2833 --network rinkeby",
  let { stdout } = await sh('ls');
  console.log(stdout);
}

main();
