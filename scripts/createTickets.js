/*jshint node: true,mocha:true */
"use strict";

var argv = require('argv');
const Web3 = require('web3');
const web3 = new Web3();

var args = argv.run();
if (args.targets.length < 2) {
    console.log("Not enough arguments. Requires number of tickets and event private key.");
    return;
}


for (var ticketNum = 0; ticketNum < args.targets[0]; ticketNum++) {
    var ticket = "" + ticketNum;
    console.log("Ticket: " + web3.utils.sha3("\x19Ethereum Signed Message:\n" + ticket.length + ticket));
    console.log("Signature: " + web3.eth.accounts.sign(ticket, args.targets[1]).signature);
    if (ticketNum !== args.targets[0]-1) {
        console.log("\n----------------------------------------------------------------------------------------------\n");
    }
}