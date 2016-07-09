// Require
const moment = require('moment');
const shell = require('shelljs');
const environment = require('./environment.js').env;

// Save database to local .gz file
var backupDatabase = (site) => {
  let container = `${environment.sites[site].containerNamespace}-db`;
  let file = createFileName(site);
  console.log(`Saving to ${file}`);

  shellExec('docker ps')
  .then((res) => {
      let thisSite = environment.sites[site].database;
      let cmd = `mysqldump --add-drop-table -u ${thisSite.user} -p${thisSite.pass} ${thisSite.name} | gzip > ${file}`;
      containerExec(container, cmd);
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.backupDatabase = backupDatabase;

// Restore db from local .gz file
var restoreDatabase = (site, file) => {
  if(file){
    let container = `${environment.sites[site].containerNamespace}-db`;
    let tempfile = `./database/temp_${moment().format('YYYYMMDDHHmmss')}.sql`;
    file = `./database/${file}`;
    console.log(`Restoring from ${file}`);

    shellExec('docker ps')
    .then((res) => {
      let cmd = `gzip -dc ${file} > ${tempfile}`;
      return shellExec(cmd);
    })
    .then((res) => {
      let thisSite = environment.sites[site].database;
      let cmd = `mysql -u ${thisSite.user} -p${thisSite.pass} ${thisSite.name} < ${tempfile}`;
      return containerExec(container, cmd);
    })
    .then((res) => {
      let cmd = `rm ${tempfile}`;
      shellExec(cmd);
    })
    .catch((err) => {
      console.log(err.message);
    });
  }
};
exports.restoreDatabase = restoreDatabase;

var shellExec = (command) => {
  if(!command.toLowerCase){
    return Promise.reject(new Error('shellExec error: need to supply a command string'))
  }
  return new Promise((resolve, reject) => {
    shell.exec(command, (code, stdout, stderr) => {
      if(stderr){
        reject(new Error(stderr));
      }
      resolve(stdout);
    });
  });
};

var containerExec = (container, command) => {
  if(!container.toLowerCase){
    return Promise.reject(new Error('containerExec error: need to supply container name'))
  }
  return new Promise((resolve, reject) => {
    shell.exec(`docker exec -i ${container} ${command}`, (code, stdout, stderr) => {
      resolve(stdout);
    });
  });
};

var createFileName = (site) => {
  return `./database/${environment.sites[site].backupNamespace}_${moment().format('YYYY-MM-DD_HHmmss')}.sql.gz`;
};