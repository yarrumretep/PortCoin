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

var maxgas = 1300000;

if(network) {
  console.log("Configuring network: " + network);
  var key = fs.readFileSync(require('os').homedir() + '/.demo.private.key', 'utf8');
  var wallet = Wallet.fromPrivateKey(Buffer.from(key.substring(2), 'hex'));
  console.log("Using address: " + wallet.getAddressString());
  var nodes = {
    'mainnet': 'https://mainnet.infura.io/bOyWfPGcs8jj2g9UXNYr',
    'kovan': 'https://kovan.infura.io/bOyWfPGcs8jj2g9UXNYr'
  }
  networks = {
    [network]: {
      provider: new WalletProvider(wallet, nodes[network]),
      from: wallet.getAddressString(),
      network_id: "*", // Match any network id
      gasPrice:20000000000,
      gas: maxgas
    }
  };
} else {
  console.log("Configuring network: development");
  networks = {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id
      gas: maxgas
    }
  }
  network = 'development';
}

module.exports = {
  network,
  networks: networks
};
