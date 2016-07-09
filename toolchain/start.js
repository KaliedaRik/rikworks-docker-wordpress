/*
Command line format

$ node toolchain/start.js [site]

$ node toolchain/start.js
$ node toolchain/start.js site01
*/

const compose = require('./startFunctions.js');

var args = process.argv.slice(2),
	site;

if(Array.isArray(args) && args.length >= 0){
	site = (args[1] != null) ? args[0] : false;
	compose.start(site);
}
