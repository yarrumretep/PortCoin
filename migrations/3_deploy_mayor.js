var PortCoin = artifacts.require('./PortCoin.sol');
var PortMayor = artifacts.require('./PortMayor.sol');
var ECRecovery = artifacts.require('zeppelin-solidity/contracts/ECRecovery.sol');

module.exports = function(deployer) {
  return deployer.deploy(ECRecovery)
  .then(() => deployer.link(ECRecovery, PortMayor))
  .then(() => deployer.deploy(PortMayor, PortCoin.address));
};
