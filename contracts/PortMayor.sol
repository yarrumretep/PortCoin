pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/CanReclaimToken.sol';
import 'zeppelin-solidity/contracts/ECRecovery.sol';

import './PortCoin.sol';

contract PortMayor is Ownable, HasNoEther, CanReclaimToken {

  PortCoin coin;
  mapping(address => mapping(address => bool)) seen;
  mapping(address => uint256) ticketsClaimed;

  event Attend(address attendee, uint256 ticket, address eventAddress);
  event EventCreated(address eventAddress);

  function PortMayor(address portCoinAddress) public {
    coin = PortCoin(portCoinAddress);
  }

  function electNewMayor(address newMayor) onlyOwner public {
    coin.electNewMayor(newMayor);
  }

  function isEvent(address eventAddress) view public returns (bool) {
    return seen[eventAddress][owner];
  }

  function isTicketUsed(address eventAddress, uint8 ticket) view public returns (bool){
    uint256 shifted = uint256(2) ** ticket;
    return (ticketsClaimed[eventAddress] & shifted) > 0;
  }

  function attended(address eventAddress, address who) view public returns (bool){
    return seen[eventAddress][who];
  }

  function createEvent(address eventAddress) onlyOwner public {
    seen[eventAddress][owner] = true;
    EventCreated(eventAddress);
  }

  function stringify(uint8 v) public pure returns (string ret) {
    bytes memory data = bytes(new string(3));
    data[0] = bytes1(48 + (v / 100) % 10);
    data[1] = bytes1(48 + (v / 10) % 10);
    data[2] = bytes1(48 + v % 10);
    return string(data);
  }

  function attend(uint8 ticket, bytes signature) public {
      // Docs say "\x19Ethereum Signed Message:\n"+message.length + message is how web3.eth.accounts.sign formats the message
    address eventAddress = ECRecovery.recover(keccak256("\x19Ethereum Signed Message:\n3",stringify(ticket)),signature);
    require(isEvent(eventAddress));
    require(!isTicketUsed(eventAddress, ticket));
    require(!attended(eventAddress, msg.sender));
    uint256 shifted = uint256(2) ** ticket;
    ticketsClaimed[eventAddress] = ticketsClaimed[eventAddress] | shifted;
    coin.issue(msg.sender, 1);
    Attend(msg.sender, ticket, eventAddress);
  }

  function issue(address to, uint quantity) public onlyOwner {
    coin.issue(to, quantity);
  }
}
