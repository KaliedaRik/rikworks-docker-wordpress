const db = require('./siteFunctions.js');

var args = process.argv.slice(2),
	action, env, file;

var backup = () => {
	db.backupSite(env);
};

var restore = () => {
	db.restoreSite(env, file);
};

const actions = {
	backup: backup,
	restore: restore
}

if(Array.isArray(args) && args.length >= 0){
	action = (args[0] != null) ? args[0] : 'backup';
	env = (args[1] != null) ? args[1] : 'development';
	file = (args[2] != null) ? args[2] : false;
	if(actions[action] != null) {
		actions[action]();
	}
}
