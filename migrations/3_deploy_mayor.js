var PortCoin = artifacts.require('./PortCoin.sol');
var PortMayor = artifacts.require('./PortMayor.sol');

module.exports = function(deployer) {
  return deployer.deploy(PortMayor, PortCoin.address);
};
