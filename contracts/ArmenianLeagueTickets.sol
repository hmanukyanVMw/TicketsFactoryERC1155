// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MyUSDToken.sol";
import "hardhat/console.sol";

contract ArmenianLeagueTickets is ERC1155, Ownable {
    string public name;
    string public symbol;
    uint256 public cost = 0.01 ether;
    uint256 public USDCCost = 30;
    uint private constant MAX_TEAM_ID = 9;
    uint256 public MAX_TICKET_NUMBER = 1000;
    MyUSDToken public mysUSDToken;
    mapping(uint64 => uint256) private ticketBalances;

    event ReceivedPurchase(address caller, uint amount, string message);

    mapping(uint => string) public tokenURI;

    receive() external payable {
        emit ReceivedPurchase(msg.sender, msg.value, "buy tickets with Ether success");
    }

    function balanceTickets(uint64 _id) public view returns (uint256) {
        return ticketBalances[_id];
    }

    function balanceOfTickets()
    public
    view
    returns (uint256[] memory)
    {
        uint256[] memory batchBalances = new uint256[](10);

        for (uint64 i = 0; i < 9; ++i) {
            batchBalances[i] = balanceTickets(i);
        }

        return batchBalances;
    }


    constructor(MyUSDToken _mysUSDToken) ERC1155("") {
        name = "ArmenianPremierLeague";
        symbol = "ArmenianPremierLeague";
        mysUSDToken = _mysUSDToken;
    }

    modifier checkCost(uint256 amount) {
        require(msg.value / cost == amount, "amount should be equal cost");

        _;
    }

    modifier checkTicketsAvailability(uint64 id, uint256 amount) {
        if (id < 0 || id > MAX_TEAM_ID) {
            require(false, "Wrong team parameter");
        }

        if (ticketBalances[id] + amount > MAX_TICKET_NUMBER) {
            require(false, "The amount of tickets is not available");
        }

        _;
    }

    function mint(address _to, uint64 _id, uint256 _amount)
    external
    payable
    checkCost(_amount)
    checkTicketsAvailability(_id, _amount)
    {
        _mint(_to, _id, _amount, "");
        ticketBalances[_id] += _amount;
    }

    function mintByUSDC(address _to, uint64 _id, uint256 _amount)
    external
    payable
    checkTicketsAvailability(_id, _amount)
    {
        console.log("Sender address is %s tokens", address(this));

        mysUSDToken.transferFrom(msg.sender, address(this), _amount * USDCCost);
        _mint(_to, _id, _amount, "");
        ticketBalances[_id] += _amount;
    }

    function mintBatch(address _to, uint[] memory _ids, uint[] memory _amounts) external onlyOwner {
        _mintBatch(_to, _ids, _amounts, "");
    }

    function burn(uint _id, uint _amount) external {
        _burn(msg.sender, _id, _amount);
    }

    function burnBatch(uint[] memory _ids, uint[] memory _amounts) external {
        _burnBatch(msg.sender, _ids, _amounts);
    }


    function burnForMint(address _from, uint[] memory _burnIds, uint[] memory _burnAmounts, uint[] memory _mintIds, uint[] memory _mintAmounts) external onlyOwner {
        _burnBatch(_from, _burnIds, _burnAmounts);
        _mintBatch(_from, _mintIds, _mintAmounts, "");
    }

    function setURI(uint _id, string memory _uri) external {
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function uri(uint _id) public override view returns (string memory) {
        return tokenURI[_id];
    }

    function withdraw() external {
        require(address(this).balance > 0, "address balance should be greater 0");
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Failed withdraw money");
    }
}
