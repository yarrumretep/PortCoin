var networkConfig = require('../truffle.js');
var contract = require('truffle-contract');
var Migrations = contract(require('../build/contracts/Migrations.json'));

Migrations.setProvider(networkConfig.networks[networkConfig.network].provider);

var migrationAddress = "0x49ff98CF5eB27651C2A4bAb9B6271889491Ea2d8";

Migrations.at(migrationAddress).then(migrations => {
  migrations.last_completed_migration().then(result => {
    console.log("Migration: " + result);
  })
})
