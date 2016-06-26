const watcher = require('./watcher.js');

var args = process.argv.slice(2);

var currentEnv = (Array.isArray(args) && args.length > 0) ? args : 'development';

watcher.startWatching(currentEnv);