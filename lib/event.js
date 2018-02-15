const Account = require('eth-lib/lib/account');
const Hash = require('eth-lib/lib/hash');

function hashFromTicketNumber(i) {
  return Hash.keccak256s("\x19Ethereum Signed Message:\n3" + ("00" + i).slice(-3))
}

function createEvent(ticketCount) {
  const account = Account.create();
  var tickets = [];
  for (var i = 1; i <= ticketCount; i++) {
    var hash = hashFromTicketNumber(i);
    var signature = Account.sign(hash, account.privateKey);
    var vrs = Account.decodeSignature(signature);
    tickets.push(decode(i, signature));
  }
  return {
    event: account.address.toLowerCase(),
    tickets
  }
}

function getEventAddress(ticketNumber, signature) {
  var hash = hashFromTicketNumber(ticketNumber);
  return Account.recover(hash, signature);
}

function decode(ticketNumber, signature) {
  var vrs = Account.decodeSignature(signature);
  return {
    n: ticketNumber,
    v: vrs[0],
    r: vrs[1],
    s: vrs[2],
    sig: signature
  };
}

module.exports = {
  createEvent,
  getEventAddress,
  decode
}