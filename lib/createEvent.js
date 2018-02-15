const Account = require('eth-lib/lib/account');
const Hash = require('eth-lib/lib/hash');

function createEvent(ticketCount) {
  const account = Account.create();
  var tickets = [];
  for (var i = 1; i <= ticketCount; i++) {
    var hash = Hash.keccak256s("\x19Ethereum Signed Message:\n3" + ("00" + i).slice(-3))
    var signature = Account.sign(hash, account.privateKey);
    var vrs = Account.decodeSignature(signature);
    tickets.push({
      n: i,
      v: vrs[0],
      r: vrs[1],
      s: vrs[2],
      sig: signature
    });
  }
  return {
    event: account.address.toLowerCase(),
    tickets
  }
}

module.exports = createEvent;