const Web3 = require('web3');
const wallet = require('ethereumjs-wallet');
const fs = require('fs');

var mainnet = 'https://mainnet.infura.io/bOyWfPGcs8jj2g9UXNYr';
var kovan = 'https://kovan.infura.io/bOyWfPGcs8jj2g9UXNYr';


var key = fs.readFileSync('/Users/pete/.demo.private.key', 'utf8');
var w = wallet.fromPrivateKey(Buffer.from(key.substring(2), 'hex'));
console.log(w.getAddressString());


var web3 = new Web3(new Web3.providers.HttpProvider(mainnet));
web3.eth.getBalance(w.getAddressString()).then(balance => {
  console.log(balance);
})
