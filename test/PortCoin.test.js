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
        return Promise.resolve().then(() => mayor.isEventActive(eventAddress.getAddressString()))
            .then(result => expect(result).toBe(false))
            .then(() => mayor.createEvent(eventAddress.getAddressString()))
            .then(result => {
                expect(result.logs[0].event).toBe('EventCreated');
                expect(result.logs[0].args.eventAddress).toBe(eventAddress.getAddressString());
            })
            .then(() => mayor.isEventActive(eventAddress.getAddressString()))
            .then(result => expect(result).toBe(true));
    });
    it('should issue coins and not allow the same ticket multiple times', () => {
        let eventAddress = wallet.generate();
        console.log(eventAddress.getAddressString());
        return mayor.createEvent(eventAddress.getAddressString())
            .then(() => {
                var ticket = 1;
                var signature = web3.eth.accounts.sign(web3.utils.numberToHex(web3.utils.soliditySha3(ticket)).slice(2), eventAddress.getPrivateKeyString());
                console.log(signature);
                return mayor.attend(ticket, signature.signature);
            })
            .then((response) => { console.log(JSON.stringify(response)); return portcoin.balanceOf(accounts[0]); })
            .then((response) => {
                expect(JSON.stringify(response)).toBe("\"1\"");
            })
            .then(() => {
                var ticket = 1;
                var signature = web3.eth.accounts.sign(web3.utils.numberToHex(web3.utils.soliditySha3(ticket)).slice(2), eventAddress.getPrivateKeyString());
                console.log(signature);
                return mayor.attend(ticket, signature.signature);
            });
    });
});