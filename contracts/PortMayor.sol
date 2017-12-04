pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'zeppelin-solidity/contracts/ownership/CanReclaimToken.sol';
import 'zeppelin-solidity/contracts/ECRecovery.sol';

import './PortCoin.sol';

contract PortMayor is Ownable, HasNoEther, CanReclaimToken {

  PortCoin coin = PortCoin(0x0);
  mapping(address => bool) active;
  mapping(address => mapping(address => bool)) seen;

  event Attend(address attendee, address eventPublicKey);
  event EventCreated(address eventPublicKey);
  event EventEnded(address eventPublicKey);

  function electNewMayor(address newMayor) onlyOwner public {
    coin.electNewMayor(newMayor);
  }

  function createEvent(address publicKey) onlyOwner public {
    active[publicKey] = true;
    EventCreated(publicKey);
  }

  function endEvent(address publicKey) onlyOwner public {
    active[publicKey] = false;
    EventEnded(publicKey);
  }

  function attended(address publicKey, address who) view public returns (bool){
    return seen[publicKey][who];
  }

  function attend(bytes signature, address publicKey) public {
    require(active[publicKey]);
    require(!seen[publicKey][msg.sender]);
    require(ECRecovery.recover(keccak256(msg.sender), signature) == publicKey);
    seen[publicKey][msg.sender] = true;
    coin.issue(msg.sender, 1);
    Attend(msg.sender, publicKey);
  }
}
