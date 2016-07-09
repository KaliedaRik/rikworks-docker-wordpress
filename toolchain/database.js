/*
Command line format
- for restore, the zipped file should be in ./database folder

$ node toolchain/database.js [command] [site] [file]

$ node toolchain/database.js backup site01
$ node toolchain/database.js restore site01 file.sql.gz
*/

const db = require('./databaseFunctions.js');

var args = process.argv.slice(2),
	action, site, file;

var backup = () => {
	if(site){
		db.backupDatabase(site);
	}
};

var restore = () => {
	if(site && file){
		db.restoreDatabase(site, file);
	}
};

const actions = {
	backup: backup,
	restore: restore
}

if(Array.isArray(args) && args.length >= 0){
	action = (args[0] != null) ? args[0] : 'backup';
	site = (args[1] != null) ? args[1] : false;
	file = (args[2] != null) ? args[2] : false;
	if(actions[action] != null) {
		actions[action]();
	}
}
