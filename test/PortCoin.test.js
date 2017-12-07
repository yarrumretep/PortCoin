const expect = require('expect');
const wallet = require('ethereumjs-wallet');
const Web3 = require('web3');
const web3 = new Web3();
var PortCoin = artifacts.require("./PortCoin.sol");
var PortMayor = artifacts.require('./PortMayor.sol');

contract('PortCoin', function(accounts) {
  var portcoin;
  var mayor;

  before(() => {
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

  it('should create event', () => {
    var address = wallet.generate();
    console.log("ADDRESS: " + address.getAddressString());
    return Promise.resolve()
    .then(()=>mayor.isEventActive(address.getAddressString()))
    .then(result=>expect(result).toBe(false))
    .then(()=>mayor.createEvent(address.getAddressString()))
    .then(result => {
      expect(result.logs[0].event).toBe('EventCreated');
      expect(result.logs[0].args.eventPublicKey).toBe(address.getAddressString());
    })
    .then(()=>mayor.isEventActive(address.getAddressString()))
    .then(result=>expect(result).toBe(true))
    .then(()=>mayor.endEvent(address.getAddressString()))
    .then(result => {
      console.log(JSON.stringify(result, null, "    "));
      // expect(result.logs[0].event).toBe('EventEnded');
      // expect(result.logs[0].args.eventPublicKey).toBe(address.getAddressString());
    })
    .then(()=>mayor.isEventActive(address.getAddressString()))
    .then(result=>expect(result).toBe(false))
  })

  it('should issue coins', () => {
    var address = wallet.generate();
    console.log("ADDRESS: " + address.getAddressString());
    return mayor.createEvent(address.getAddressString())
    .then(()=>{
      console.log("ACCT: " + accounts[1])
      var signature = web3.eth.accounts.sign("Hello there", address.getPrivateKeyString())
      console.log("SIG: " + signature);
      return mayor.attend(accounts[1], signature);
    })
    .then(()=>mayor.endEvent(address.getAddressString()))
    .then(result => {
      expect(result.logs[0].event).toBe('EventEnded');
      expect(result.logs[0].args.eventPublicKey).toBe(address.getAddressString());
    })
  })

});
