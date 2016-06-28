const watcher = require('./watchFunctions.js');

var args = process.argv.slice(2);

var currentEnv = (Array.isArray(args) && args.length > 0) ? args[0] : 'development';

watcher.composeExec(currentEnv)
.then((res) => {
	watcher.startWatching(currentEnv);
})
.catch((err) => {
	console.log(err.message);
});
