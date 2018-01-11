pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/CanReclaimToken.sol';
import 'zeppelin-solidity/contracts/ECRecovery.sol';

import './PortCoin.sol';

contract PortMayor is Ownable, HasNoEther, CanReclaimToken {

  PortCoin coin;
  mapping(address => bool) active;
  mapping(address => mapping(address => bool)) seen;
  mapping(address => mapping(bytes32 => bool)) ticketUsed;

  event Attend(address attendee, address eventAddress);
  event EventCreated(address eventAddress);
  event EventEnded(address eventAddress);

  function PortMayor(address portCoinAddress) public {
    coin = PortCoin(portCoinAddress);
  }

  function isEventActive(address eventAddress) view public returns (bool){
    return active[eventAddress];
  }

  function isTicketUsed(address eventAddress, bytes32 ticket) view public returns (bool){
    return ticketUsed[eventAddress][ticket];
  }

  function attended(address eventAddress, address who) view public returns (bool){
    return seen[eventAddress][who];
  }

  function electNewMayor(address newMayor) onlyOwner public {
    coin.electNewMayor(newMayor);
  }

  function createEvent(address eventAddress) onlyOwner public {
    active[eventAddress] = true;
    EventCreated(eventAddress);
  }

  function endEvent(address eventAddress) onlyOwner public {
    active[eventAddress] = false;
    EventEnded(eventAddress);
  }

  function attend(bytes32 ticket, bytes signature) public {
    address eventAddress = ECRecovery.recover(ticket,signature);
    require(active[eventAddress]);
    require(!ticketUsed[eventAddress][ticket]);
    require(!seen[eventAddress][msg.sender]);
    seen[eventAddress][msg.sender] = true;
    ticketUsed[eventAddress][ticket]=true;
    coin.issue(msg.sender, 1);
    Attend(msg.sender, eventAddress);
  }

}
