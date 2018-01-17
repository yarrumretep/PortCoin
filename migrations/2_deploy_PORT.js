var PortCoin = artifacts.require("./PortCoin.sol");

module.exports = function(deployer) {
    deployer.deploy(PortCoin);
};
