/*jshint node: true,mocha:true */
"use strict";

var argv = require('argv');
var createEvent = require('../lib/createEvent');

var args = argv.run();
if (args.targets.length < 1) {
    console.log("Not enough arguments. Requires number of tickets.");
    return;
}

console.log(JSON.stringify(createEvent(+args.targets[0]), null, "    "))
