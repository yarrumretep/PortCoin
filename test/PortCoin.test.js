/*jshint node: true,mocha:true */
/*globals artifacts,contract*/
"use strict";
const expect = require('expect');
const wallet = require('ethereumjs-wallet');
const Web3 = require('web3');
const web3 = new Web3();
var PortCoin = artifacts.require("./PortCoin.sol");
var PortMayor = artifacts.require('./PortMayor.sol');
var ECRecovery = artifacts.require('zeppelin-solidity/contracts/ECRecovery.sol');
contract('PortCoin', function(accounts) {
    var portcoin;
    var mayor;
    beforeEach(() => {
        return PortCoin.new()
            .then((instance) => portcoin = instance)
            .then(() => ECRecovery.deployed())
            .then((instance) => {
                PortMayor.link(ECRecovery, instance.adress);
            })
            .then(() => PortMayor.new(portcoin.address))
            .then((instance) => {
                mayor = instance;
                portcoin.electNewMayor(mayor.address);
            });
    });
    it('should deploy', () => {
        return portcoin.symbol().then(symbol => expect(symbol).toBe('PORT'));
    });
    it('should create event', () => {
        let eventAddress = wallet.generate();
        return Promise.resolve().then(() => mayor.isEvent(eventAddress.getAddressString()))
            .then(result => expect(result).toBe(false))
            .then(() => mayor.createEvent(eventAddress.getAddressString()))
            .then(result => {
                expect(result.logs[0].event).toBe('EventCreated');
                expect(result.logs[0].args.eventAddress).toBe(eventAddress.getAddressString());
            })
            .then(() => mayor.isEvent(eventAddress.getAddressString()))
            .then(result => expect(result).toBe(true));
    });

    it('should stringify properly', () => {
      return mayor.stringify(0)
      .then(result => expect(result).toBe('000'))
      .then(()=>mayor.stringify(1))
      .then(result => expect(result).toBe('001'))
      .then(()=>mayor.stringify(12))
      .then(result => expect(result).toBe('012'))
      .then(()=>mayor.stringify(123))
      .then(result => expect(result).toBe('123'))
    })

    it('should issue coins and not allow the same ticket multiple times', () => {
      let eventAddress = wallet.generate();
        return mayor.createEvent(eventAddress.getAddressString())
        .then(()=> mayor.isEvent(eventAddress.getAddressString()))
        .then(result => expect(result).toBe(true))
        .then(() => mayor.isTicketUsed(eventAddress.getAddressString(), 1))
        .then(result => expect(result).toBe(false))
        .then(()=> mayor.attended(eventAddress.getAddressString(), accounts[1]))
        .then(result => expect(result).toBe(false))
        .then(() => {
          var ticket = 1;
          var signature = web3.eth.accounts.sign(("00" + ticket).slice(-3), eventAddress.getPrivateKeyString());
          return mayor.attend(ticket, signature.signature, { from: accounts[1] });
        })
        .then(() => portcoin.balanceOf(accounts[1]) )
        .then((response) => expect(+response).toBe(1))
        .then(() => {
          var ticket = 1;
          var signature = web3.eth.accounts.sign(("00" + ticket).slice(-3), eventAddress.getPrivateKeyString());
          return mayor.attend(ticket, signature.signature);
        })
        .then(()=>expect(true).toBe(false))
        .catch(error => expect(error.message).toBe("VM Exception while processing transaction: revert"))
    });
});
