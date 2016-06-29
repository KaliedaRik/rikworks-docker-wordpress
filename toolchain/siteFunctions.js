// Require
const moment = require('moment');
const shell = require('shelljs');
const environment = require('./environment.js').env;

// Save site files to local .tar.gz file
var backupSite = (env) => {
  let container = getWordpressContainerName(env);
  let file = createFileName(env);
  console.log(`Saving to ${file}`);

  shellExec('docker ps')
  .then((res) => {
      let cmd = `tar czf /tempfile.tar.gz ./`;
      return containerExec(container, cmd);
  })
  .then((res) => {
      let cmd = `docker cp ${container}:/tempfile.tar.gz ${file}`; //
      return shellExec(cmd);
  })
  .then((res) => {
      let cmd = `rm /tempfile.tar.gz`;
      containerExec(container, cmd);
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.backupSite = backupSite;

// Restore site files from local .tar.gz file
var restoreSite = (env, file) => {
  if(file){
    let container = getWordpressContainerName(env);
    file = `./sitestore/${file}`;
    console.log(`Restoring from ${file}`);

    shellExec('docker ps')
    .then((res) => {
        let cmd = `docker cp ${file} ${container}:/tempfile.tar.gz`; //
        return shellExec(cmd);
    })
    .then((res) => {
        let cmd = `tar xzf /tempfile.tar.gz`;
        return containerExec(container, cmd);
    })
    .then((res) => {
        let cmd = `rm /tempfile.tar.gz`;
        containerExec(container, cmd);
    })
    .catch((err) => {
      console.log(err.message);
    });
  }
};
exports.restoreSite = restoreSite;

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

var getWordpressContainerName = (env) => {
  return `${environment.namespace[env]}-wp`;
};

var createFileName = (env) => {
  return `./sitestore/${environment.namespace[env]}-${env}_${moment().format('YYYY-MM-DD_HHmmss')}.tar.gz`;
};
