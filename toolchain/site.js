/*
Command line format
- for restore, the zipped file should be in ./sitestore folder

$ node toolchain/site.js [command] [environment] [file]

$ node toolchain/site.js backup site01
$ node toolchain/site.js restore site01 file.tar.gz

This command copies container /var/www/html contents to local machine
$ node toolchain/site.js get site01
*/

const db = require('./siteFunctions.js');

var args = process.argv.slice(2),
	action, site, file;

var get = () => {
	if(site){
		db.pullSiteDataToLocal(site);
	}
};

var backup = () => {
	if(site){
		db.backupSite(site);
	}
};

var restore = () => {
	if(site && file){
		db.restoreSite(site, file);
	}
};

const actions = {
	get: get,
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
