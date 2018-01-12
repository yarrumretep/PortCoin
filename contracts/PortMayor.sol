pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/CanReclaimToken.sol';

import './PortCoin.sol';

contract PortMayor is Ownable, HasNoEther, CanReclaimToken {

  PortCoin coin;
  mapping(address => uint256) tickets;

  event Attend(address indexed attendee, uint256 ticket, address indexed eventAddress);
  event EventCreated(address eventAddress);

  function PortMayor(address portCoinAddress) public {
    coin = PortCoin(portCoinAddress);
  }

  function electNewMayor(address newMayor) onlyOwner public {
    coin.electNewMayor(newMayor);
  }

  function isEvent(address eventAddress) view public returns (bool) {
    return tickets[eventAddress] > 0;
  }

  function isValidTicket(address eventAddress, uint8 ticket) view public returns (bool){
    return (tickets[eventAddress] & (uint256(2) ** ticket)) > 0;
  }

  function createEvent(address eventAddress) onlyOwner public {
    tickets[eventAddress] = uint256(0) - 1; // fill with 1s
    EventCreated(eventAddress);
  }

  function stringify(uint8 v) public pure returns (string ret) {
    bytes memory data = new bytes(3);
    data[0] = bytes1(48 + (v / 100) % 10);
    data[1] = bytes1(48 + (v / 10) % 10);
    data[2] = bytes1(48 + v % 10);
    return string(data);
  }

  function attend(uint8 ticket, bytes32 r, bytes32 s, uint8 v) public {
    address eventAddress = ecrecover(keccak256("\x19Ethereum Signed Message:\n3",stringify(ticket)),v,r,s);
    require(isValidTicket(eventAddress, ticket));
    tickets[eventAddress] = tickets[eventAddress] ^ (uint256(2) ** ticket);
    coin.issue(msg.sender, 1);
    Attend(msg.sender, ticket, eventAddress);
  }

  function issue(address to, uint quantity) public onlyOwner {
    coin.issue(to, quantity);
  }
}
