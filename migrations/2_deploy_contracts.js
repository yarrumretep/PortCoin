var PortCoin = artifacts.require("./PortCoin.sol");
var PortMayor = artifacts.require('./PortMayor.sol');
var ECRecovery = artifacts.require('zeppelin-solidity/contracts/ECRecovery.sol');

module.exports = function(deployer) {
  deployer.deploy(PortCoin);
  deployer.deploy(ECRecovery);
  deployer.link(ECRecovery, PortMayor);
  deployer.deploy(PortMayor);
};
