pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/CanReclaimToken.sol';
import 'zeppelin-solidity/contracts/ECRecovery.sol';

import './PortCoin.sol';

contract PortMayor is Ownable, HasNoEther, CanReclaimToken {

  PortCoin coin;
  mapping(address => bool) activeEvents;
  mapping(address => mapping(address => bool)) seen;
  mapping(address => uint256) ticketsClaimed;

  event Attend(address attendee, uint256 ticket, address eventAddress);
  event EventCreated(address eventAddress);

  function PortMayor(address portCoinAddress) public {
    coin = PortCoin(portCoinAddress);
  }

  function isEventActive(address eventAddress) view public returns (bool){
    return activeEvents[eventAddress];
  }

  function isTicketUsed(address eventAddress, uint256 ticket) view public returns (bool){
    uint256 shifted = uint256(0x1 * uint256(2) ** ticket);
    return (ticketsClaimed[eventAddress] & shifted) > 1;
  }

  function attended(address eventAddress, address who) view public returns (bool){
    return seen[eventAddress][who];
  }

  function electNewMayor(address newMayor) onlyOwner public {
    coin.electNewMayor(newMayor);
  }

  function createEvent(address eventAddress) onlyOwner public {
    activeEvents[eventAddress] = true;
    EventCreated(eventAddress);
  }

  function attend(uint256 ticket, bytes signature) public {
    // Docs say "\x19Ethereum Signed Message:\n"+message.length + message is how web3.eth.accounts.sign formats the message
    address eventAddress = ECRecovery.recover(keccak256("\x19Ethereum Signed Message:\n32",keccak256(ticket)),signature);
    require(eventAddress!=0x0);
    require(isEventActive(eventAddress));
    require(ticket<256);
    require(!isTicketUsed(eventAddress, ticket));
    require(!seen[eventAddress][msg.sender]);
    uint256 shifted = uint256(0x1 * uint256(2) ** ticket);
    ticketsClaimed[eventAddress]=ticketsClaimed[eventAddress] | shifted;
    coin.issue(msg.sender, 1);
    Attend(msg.sender, ticket, eventAddress);

  }
}
