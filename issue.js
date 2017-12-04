const argv = require('argv');
const contract = require('truffle-contract');

const PortCoinMeta = require('./build/contracts/PortCoin.json');
const truffle = require('./truffle');

const PortCoin = contract(PortCoinMeta);

var args = argv.option([{
  name:'network',
  type:'string'
}]).run();

const network = truffle.networks['mainnet'];
//console.log(network);

PortCoin.setProvider(network.provider)

var [to, amount] = args.targets;

console.log("Issuing " + amount + " to " + to);

PortCoin.at('0x8ed3ba9c4028865f77b3c8917a2003131709fbee')
.then(instance => instance.issue(to, amount, {
  from:network.from
}))
.then(result => {
  console.log(result);
})
.catch(console.log);
