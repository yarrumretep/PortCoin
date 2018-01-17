const argv = require('argv');
const contract = require('truffle-contract');

const PortCoinMeta = require('./build/contracts/PortCoin.json');
const truffle = require('./truffle');

const PortCoin = contract(PortCoinMeta);

var args = argv.option([{
  name:'network',
  type:'string'
}]).run();

const network = truffle.networks[truffle.network];
//console.log(network);

PortCoin.setProvider(network.provider)

var [to, amount] = args.targets;

console.log("Issuing " + amount + " to " + to);

PortCoin.deployed()
.then(instance => instance.issue(to, amount, {
  from:network.from
}))
.then(result => {
  console.log(result);
})
.catch(console.log);
