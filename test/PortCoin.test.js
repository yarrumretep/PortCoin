const expect = require('expect');
var PortCoin = artifacts.require("./PortCoin.sol");
var PortMayor = artifacts.require('./PortMayor.sol');

contract('PortCoin', function(accounts) {
  var portcoin;
  var mayor;

  beforeEach(() => {
    return PortCoin.deployed()
      .then(instance => {
        portcoin = instance;
      })
      .then(()=>PortMayor.deployed())
      .then(instance => {
        mayor = instance;
        portcoin.electNewMayor(mayor.address);
      })
  })

  it('should deploy', () => {
    return portcoin.symbol()
      .then(symbol => expect(symbol).toBe('PORT'))
  })

});
