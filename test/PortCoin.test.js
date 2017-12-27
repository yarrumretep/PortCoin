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
    var ecRecover;

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

    it('should create and end event', () => {
        let eventAddress = wallet.generate();
        return Promise.resolve().then(() => mayor.isEventActive(eventAddress.getAddressString()))
            .then(result => expect(result).toBe(false))
            .then(() => mayor.createEvent(eventAddress.getAddressString()))
            .then(result => {
                expect(result.logs[0].event).toBe('EventCreated');
                expect(result.logs[0].args.eventAddress).toBe(eventAddress.getAddressString());
            })
            .then(() => mayor.isEventActive(eventAddress.getAddressString()))
            .then(result => expect(result).toBe(true))
            .then(() => mayor.endEvent(eventAddress.getAddressString()))
            .then(result => {
                console.log(JSON.stringify(result, null, "    "));
                expect(result.logs[0].event).toBe('EventEnded');
                expect(result.logs[0].args.eventAddress).toBe(eventAddress.getAddressString());
            })
            .then(() => mayor.isEventActive(eventAddress.getAddressString()))
            .then(result => expect(result).toBe(false));
    });

    it('should issue coins and not allow the same ticket multiple times', () => {
        //console.log(mayor)
        let eventAddress = wallet.generate();
        console.log("ADDRESS: " + eventAddress.getAddressString());
        return mayor.createEvent(eventAddress.getAddressString())
            .then(() => {
                var ticket = "1";
                var signature = web3.eth.accounts.sign(ticket, eventAddress.getPrivateKeyString());
                var message = web3.utils.soliditySha3("\x19Ethereum Signed Message:\n" + ticket.length + ticket);
                return mayor.attend(message, signature.signature);
            })
            .then(() => portcoin.balanceOf(accounts[0]))
            .then((response) => {
                expect(JSON.stringify(response)).toBe("\"1\"");
            })
            .then(() => {
                var ticket = "1";
                var signature = web3.eth.accounts.sign(ticket, eventAddress.getPrivateKeyString());
                var message = web3.utils.sha3("\x19Ethereum Signed Message:\n" + ticket.length + ticket);
                return mayor.attend(message, signature.signature, { from: accounts[1] });
            })
            .catch((err) => expect(err.message).toBe("VM Exception while processing transaction: revert"));
    });

    it('should ', () => {
        //console.log(mayor)
        let eventAddress = wallet.generate();
        console.log("ADDRESS: " + eventAddress.getAddressString());
        return mayor.createEvent(eventAddress.getAddressString())
            .then(() => {
                var ticket = "1";
                var signature = web3.eth.accounts.sign(ticket, eventAddress.getPrivateKeyString());
                var message = web3.utils.soliditySha3("\x19Ethereum Signed Message:\n" + ticket.length + ticket);
                return mayor.attend(message, signature.signature);
            })
            .then(() => portcoin.balanceOf(accounts[0]))
            .then((response) => {
                expect(JSON.stringify(response)).toBe("\"1\"");
            })
            .then(() => {
                var ticket = "1";
                var signature = web3.eth.accounts.sign(ticket, eventAddress.getPrivateKeyString());
                var message = web3.utils.sha3("\x19Ethereum Signed Message:\n" + ticket.length + ticket);
                return mayor.attend(message, signature.signature, { from: accounts[1] });
            })
            .catch((err) => expect(err.message).toBe("VM Exception while processing transaction: revert"));
    });

});