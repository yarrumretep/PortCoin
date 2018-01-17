const fs = require('fs');
const p = require('path');
const mkdirp = require('mkdirp');

var done = {};

function find(p1, path) {
  var importpath;
  if (p1.startsWith(".")) {
    importpath = p.join(p.dirname(path), p1);
  } else {
    var node = p.join(p.dirname(path), "node_modules");
    while (!fs.existsSync(node) && p.dirname(p.dirname(node))) {
      node = p.join(p.dirname(p.dirname(node)), 'node_modules');
    }
    if (!fs.existsSync(node)) throw new Error("Couldn't find node_modules");
    importpath = p.join(node, p1);
  }
  return importpath;
}

function inline(path) {
  if (!done[path]) {
    var code = fs.readFileSync(path, 'utf-8');
    code = code.replace(/import '([^']+)';/g, (match, p1) => {
      return inline(find(p1, path));
    });
    code = code.replace(/pragma [^;]*;/g, "");
    code = code.replace(/import "([^"]+)";/g, (match, p1) => {
      return inline(find(p1, path))
    });
    done[path] = true;
    return "/* Inlined from " + path + " */\n" + code;
  } else {
    return "";
  }
}

var root = './contracts';
var out = './inlined';
mkdirp.sync(out);
fs.readdirSync(root).forEach(file => {
  done = {};
  var code = "pragma solidity ^0.4.11;\n" + inline(root + "/" + file);
  fs.writeFileSync(out + "/" + file, code);
})


//console.log(code);
