/*jshint node: true,mocha:true */
/*globals artifacts,contract*/
"use strict";
const expect = require('expect');
const createEvent = require('../lib/createEvent');

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

    it('should set mayor', () => {
      return mayor.issue(accounts[4], 1)
      .then(()=>portcoin.balanceOf(accounts[4]))
      .then(result=>expect(+result).toBe(1))
      .then(()=>mayor.electNewMayor(accounts[1]))
      .then(()=>mayor.issue(accounts[5], 3))
      .then(()=>expect(true).toBe(false, "No exception thrown"))
      .catch(error=>expect(error.message).toBe("VM Exception while processing transaction: revert"))
      .then(()=>portcoin.issue(accounts[5], 2, {from:accounts[1]}))
      .then(()=>portcoin.balanceOf(accounts[5]))
      .then(result=>expect(+result).toBe(2))
    })

    it('should create event', () => {
      let event = createEvent(2);
        return Promise.resolve().then(() => mayor.isEvent(event.event))
            .then(result => expect(result).toBe(false))
            .then(() => mayor.createEvent(event.event))
            .then(result => {
                expect(result.logs[0].event).toBe('EventCreated');
                expect(result.logs[0].args.eventAddress).toBe(event.event);
            })
            .then(() => mayor.isEvent(event.event))
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
      var event = createEvent(2);

      return mayor.createEvent(event.event)
        .then(()=> mayor.isEvent(event.event))
        .then(result => expect(result).toBe(true))
        .then(() => mayor.isValidTicket(event.event, 1))
        .then(result => expect(result).toBe(true))
        .then(() => mayor.isValidTicket(event.event, 2))
        .then(result => expect(result).toBe(true))

        .then(() => mayor.attend(event.tickets[0].n, event.tickets[0].r, event.tickets[0].s, event.tickets[0].v, { from: accounts[1] }))
        .then(result => console.log("GAS (first ticket): " + result.receipt.gasUsed))
        .then(() => portcoin.balanceOf(accounts[1]) )
        .then((response) => expect(+response).toBe(1))
        .then(() => mayor.isValidTicket(event.event, 1))
        .then(result => expect(result).toBe(false))
        .then(() => mayor.isValidTicket(event.event, 2))
        .then(result => expect(result).toBe(true))

        .then(() => mayor.attend(event.tickets[1].n, event.tickets[1].r, event.tickets[1].s, event.tickets[1].v, { from: accounts[1] }))
        .then(result => console.log("GAS (second ticket): " + result.receipt.gasUsed))
        .then(() => portcoin.balanceOf(accounts[1]) )
        .then((response) => expect(+response).toBe(2))
        .then(() => mayor.isValidTicket(event.event, 1))
        .then(result => expect(result).toBe(false))
        .then(() => mayor.isValidTicket(event.event, 2))
        .then(result => expect(result).toBe(false))
        .then(() => mayor.attend(event.tickets[0].n, event.tickets[0].r, event.tickets[0].s, event.tickets[0].v, { from: accounts[1] }))
        .then(()=>expect(true).toBe(false))
        .catch(e=>expect(e.message).toBe("VM Exception while processing transaction: revert"))
    });
});
