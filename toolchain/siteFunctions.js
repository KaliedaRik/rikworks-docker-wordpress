// Require
const moment = require('moment');
const shell = require('shelljs');
const environment = require('./environment.js').env;

// Copy site files to local folder
var pullSiteDataToLocal = (site) => {
  let container = `${environment.sites[site].containerNamespace}-wp`;

  shellExec('docker ps')
  .then((res) => {
      let cmd = `docker cp ${container}:/var/www/html/. ./${environment.sites[site].directoryName}`;
      shellExec(cmd);
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.pullSiteDataToLocal = pullSiteDataToLocal;

// Save site files to local .tar.gz file
var backupSite = (site) => {
  let container = `${environment.sites[site].containerNamespace}-wp`;
  let file = createFileName(site);
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
var restoreSite = (site, file) => {
  if(file){
    let container = `${environment.sites[site].containerNamespace}-wp`;
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

var createFileName = (site) => {
  return `./sitestore/${environment.sites[site].backupNamespace}_${moment().format('YYYY-MM-DD_HHmmss')}.tar.gz`;
};
