/*jshint node: true,mocha:true */
/*globals artifacts,contract*/
"use strict";
const expect = require('expect');
const wallet = require('ethereumjs-wallet');
const Web3 = require('web3');
const web3 = new Web3();
var PortCoin = artifacts.require("./PortCoin.sol");
var PortMayor = artifacts.require('./PortMayor.sol');

contract('PortCoin', function(accounts) {
    var portcoin;
    var mayor;
    beforeEach(() => {
        return PortCoin.new()
            .then((instance) => portcoin = instance)
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
      var signature = web3.eth.accounts.sign("001", eventAddress.getPrivateKeyString());
      var sig2 = web3.eth.accounts.sign("002", eventAddress.getPrivateKeyString());

      return mayor.createEvent(eventAddress.getAddressString())
        .then(()=> mayor.isEvent(eventAddress.getAddressString()))
        .then(result => expect(result).toBe(true))
        .then(() => mayor.isValidTicket(eventAddress.getAddressString(), 1))
        .then(result => expect(result).toBe(true))
        .then(() => mayor.isValidTicket(eventAddress.getAddressString(), 2))
        .then(result => expect(result).toBe(true))

        .then(() => mayor.attend(1, signature.r, signature.s, signature.v, { from: accounts[1] }))
        .then(result => console.log("GAS (first ticket): " + result.receipt.gasUsed))
        .then(() => portcoin.balanceOf(accounts[1]) )
        .then((response) => expect(+response).toBe(1))
        .then(() => mayor.isValidTicket(eventAddress.getAddressString(), 1))
        .then(result => expect(result).toBe(false))
        .then(() => mayor.isValidTicket(eventAddress.getAddressString(), 2))
        .then(result => expect(result).toBe(true))

        .then(() => mayor.attend(2, sig2.r, sig2.s, sig2.v, { from: accounts[1] }))
        .then(result => console.log("GAS (second ticket): " + result.receipt.gasUsed))
        .then(() => portcoin.balanceOf(accounts[1]) )
        .then((response) => expect(+response).toBe(2))
        .then(() => mayor.isValidTicket(eventAddress.getAddressString(), 1))
        .then(result => expect(result).toBe(false))
        .then(() => mayor.isValidTicket(eventAddress.getAddressString(), 2))
        .then(result => expect(result).toBe(false))
        .then(()=>expect(() => mayor.attend(1, signature.r, signature.s, signature.v, { from: accounts[1] })).toThrow("VM Exception while processing transaction: revert"))
    });
});
