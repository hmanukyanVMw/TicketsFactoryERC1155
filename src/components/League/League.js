import {ethers} from "ethers"
import React from "react";
import {useEffect, useState} from "react";
import "./Legue.css";
import {TEAMS} from "./constants";
import ArmenianLeagueTicketsFactoryRinkeby from "../../ArmenianLeagueTicketsFactory.deployed.json";
import MyUSDToken from "../../myUSDToken.deployed.json";
import ArmenianLeagueTicketsFactoryDev from "../../ArmenianLeagueTicketsFactory.deployed-dev.json";


function League() {
  const [contractData, setContractData] = useState({
    owner: '',
    token: {},
    contract: {},
    provider: {},
  });
  const [amount, setAmount] = useState(Array(10).fill(0));
  const [contractInfo, setContractInfo] = useState({
    balance: '',
    cost: '',
    costUSDC: '',
    USDCBalance: '',
    soldByUSDCBalance: '',
    ticketCounts: [],
    soldTickets: [],
  });
  const [error, setError] = useState("");

  const {token, contract, owner, networkName, provider} = contractData;
  const {cost, costUSDC, balance, USDCBalance, soldByUSDCBalance, ticketCounts, soldTickets} = contractInfo;

  const mintByUSDC = async (id) => {
    setError('');

    if (amount[id] === 0) {
      alert("cannot be 0");
      return;
    } else if (Number.isInteger(amount[id])) {
      alert("amount should be integer");
      return;
    }

    try {
      const uri = await contract.uri(id)
      const transactionApprove = await token.approve(ArmenianLeagueTicketsFactoryRinkeby.address, amount[id] * costUSDC);
      await transactionApprove.wait();
      const transaction = await contract.mintByUSDC(owner, id, amount[id]);
      await transaction.wait();
      const log = await provider.getTransactionReceipt(transaction.hash);

      console.log("log is ", log.logs);
      // setError(log.logs.toString());
      await updateContractInfo();

      if (!uri && networkName === 'rinkeby') {
        const transactionSetURI = await contract.setURI(id, `${ArmenianLeagueTicketsFactoryRinkeby.baseUrl + id}`)
        transactionSetURI.wait();
        setError('');
        await updateContractInfo();
      }
    } catch (e) {
      await updateContractInfo();
      setError(e.data !== undefined ? e.data.message : e.message);
    }
  }

  const mint = async (id) => {
    if (amount[id] === 0) {
      alert("cannot be 0");
      return;
    } else if (Number.isInteger(amount[id])) {
      alert("amount should be integer");
      return;
    }
    try {
      const options = {
        value: ethers.utils.parseEther((parseInt(amount[id]) * 0.01).toString()),
        // from: owner //@TODO when need to change owner msg.from address
      };
      const uri = await contract.uri(id)
      const transaction = await contract.mint(owner, id, amount[id], options);
      await transaction.wait();
      const log = await provider.getTransactionReceipt(transaction.hash);

      console.log("log is ", log.logs);
      // setError(log.logs.toString());

      if (!uri && networkName === 'rinkeby') {
        const transactionSetURI = await contract.setURI(id, `${ArmenianLeagueTicketsFactoryRinkeby.baseUrl + id}`)
        transactionSetURI.wait();
        setError('');
      }
      await initialConnection();
    } catch (e) {
      setError(e.data !== undefined ? e.data.message : e.message);
    }
  }

  const initialConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      const data = await window.ethereum.request({method: "eth_requestAccounts"});
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const singer = provider.getSigner();
      const network = await provider.getNetwork();

      const contract = new ethers.Contract(
         network.name === "rinkeby" ? ArmenianLeagueTicketsFactoryRinkeby.address : ArmenianLeagueTicketsFactoryDev.address,
        network.name === "rinkeby" ? ArmenianLeagueTicketsFactoryRinkeby.abi : ArmenianLeagueTicketsFactoryDev.abi,
        singer
      );


      const token = new ethers.Contract(
        MyUSDToken.address,
        MyUSDToken.abi,
        singer
      );

      // const trans = await TokenContract.transfer(TokenContract.address, 1000000);
      // await trans.wait();

      setContractData({
        contract,
        token,
        provider,
        networkName: network.name,
        owner: data[0],
      });

      await updateContractInfo(provider, token, contract, data[0]);
    } else {
      console.log("Your browser does not support metamask. Please use other browser");
    }
  }

  const updateContractInfo = async (
    provider = contractData.provider,
    token = contractData.token,
    contract = contractData.contract,
    owner = contractData.owner,
  ) => {
    const senderUSDCBalance = await token.balanceOf(owner);
    const soldByUSDCBalance = await token.balanceOf(ArmenianLeagueTicketsFactoryRinkeby.address);

    const batches = await contract.balanceOfBatch(
      Array(10).fill(owner),
      Array.from({ length: 10 }, (v, k) => k)
    );

    const soldTickets = await contract.balanceOfTickets();
    const costHexadecimal = await contract.cost();
    const costUSDCHexadecimal = await contract.USDCCost();
    const balance = await provider.getBalance(owner);

    setContractInfo({
      cost: ethers.utils.formatEther(costHexadecimal),
      balance: ethers.utils.formatEther(balance),
      costUSDC: parseInt(costUSDCHexadecimal, 10),
      USDCBalance: parseInt(senderUSDCBalance, 10),
      soldByUSDCBalance: parseInt(soldByUSDCBalance, 10),
      ticketCounts: batches.map(item => parseInt(item, 10)),
      soldTickets: soldTickets.map(item => parseInt(item, 10)),
    });
  }

  const withdraw = async () => {
    try {
      const withdraw = await contract.withdraw();
      await withdraw.wait()

      await updateContractInfo();
      setError('');
    } catch (e) {
      setError(e.data !== undefined ? e.data.message : e.message);
    }

  }

  useEffect(  () => {
    initialConnection();
  }, [])

  return (
    <div className="App">
      <h5>Your Ether balance is: {balance} Ether</h5>
      <h5>Your USDC balance is: {USDCBalance}$</h5>
      <h5>Sold tickets by USDC balance is: {soldByUSDCBalance}$</h5>
      <h5>Ticket cost is: {cost} Ether OR {costUSDC}USDC Token</h5>
      <p style={{color: 'red'}}>{error}</p>
      <table className="table">
        <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Team Name</th>
          <th scope="col">My ticket count</th>
          <th scope="col">Sold Ticket count</th>
          <th scope="col">Amount</th>
          <th scope="col">buy ticket</th>
          <th scope="col">buy ticket in $</th>
        </tr>
        </thead>
        <tbody>
        {
          TEAMS.map((val, key) => (
            <React.Fragment key={key}>
              <tr>
                <th scope="row">{++key}</th>
                <td>{val.name}</td>
                <td>{ticketCounts[val.id] ?? '-'}</td>
                <td>{soldTickets[val.id] ?? '-'}</td>
                <td>
                  <input
                    value={amount[val.id]}
                    className="inputAmount"
                    type="number"
                    onChange={e => setAmount((prev) => {
                      prev[val.id] = e.target.value;
                      return [...prev];
                    })}
                    placeholder="amount" />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => mint(val.id)}
                  >buy ticket Ether</button>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => mintByUSDC(val.id)}
                  >buy ticket USDC</button>
                </td>
              </tr>
            </React.Fragment>
          ))
        }
        </tbody>
      </table>
      <button className="buttonSuccess" onClick={withdraw} > withdraw </button>
    </div>
  );
}

export default League;



