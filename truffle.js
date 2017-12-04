var Wallet = require('ethereumjs-wallet');
var WalletProvider = require("truffle-wallet-provider");
var fs = require('fs');

var network = null;
process.argv.forEach((arg,i) => {
  if(arg === "--network"){
    network = process.argv[i+1];
  } else if(arg.startsWith("--network=")) {
    network = arg.substring("--network=".length);
  }
})

var maxgas = 4612388;

networks = {
  development: {
    host: "localhost",
    port: 8547,
    network_id: "*", // Match any network id
    gas: maxgas
  }
}

var key = fs.readFileSync('/Users/pete/.demo.private.key', 'utf8');
var wallet = Wallet.fromPrivateKey(Buffer.from(key.substring(2), 'hex'));
var nodes = {
  'mainnet': 'https://mainnet.infura.io/bOyWfPGcs8jj2g9UXNYr',
  'kovan': 'https://kovan.infura.io/bOyWfPGcs8jj2g9UXNYr'
}

function addNetwork(name) {
  console.log("Configuring network: " + name);
  if(!networks[name]) {
    networks[name] = {
      provider: new WalletProvider(wallet, nodes[name]),
      from: wallet.getAddressString(),
      network_id: "*", // Match any network id
      gasPrice:20000000000,
      gas: maxgas
    };
  }
}
if(network) {
  addNetwork(network);
}

module.exports = {
  networks: networks
};
