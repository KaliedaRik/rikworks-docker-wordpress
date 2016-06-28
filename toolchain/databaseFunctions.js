// Require
const moment = require('moment');
const shell = require('shelljs');
const environment = require('./environment.js').env;

// Save database to local .gz file
var saveDatabase = (env) => {
  let container = getDatabaseContainerName(env);
  let file = createFileName(env);
  console.log(`Saving to ${file}`);

  shellExec('docker ps')
  .then((res) => {
      let cmd = `mysqldump --add-drop-table -u ${environment.database.user} -p${environment.database.pass} ${environment.database.name} | gzip > ${file}`;
      containerExec(container, cmd);
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.saveDatabase = saveDatabase;

// Restore db from local .gz file
var restoreDatabase = (env, file) => {
  if(file){
    let container = getDatabaseContainerName(env);
    let tempfile = `./database/temp_${moment().format('YYYYMMDDHHmmss')}.sql`;
    file = `./database/${file}`;
    console.log(`Restoring from ${file}`);

    shellExec('docker ps')
    .then((res) => {
      let cmd = `gzip -dc ${file} > ${tempfile}`;
      return shellExec(cmd);
    })
    .then((res) => {
      let cmd = `mysql -u ${environment.database.user} -p${environment.database.pass} ${environment.database.name} < ${tempfile}`;
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

var getDatabaseContainerName = (env) => {
  return `${environment.namespace[env]}-db`;
};

var createFileName = (env) => {
  return `./database/${environment.namespace[env]}-${env}_${moment().format('YYYY-MM-DD_HHmmss')}.sql.gz`;
};
