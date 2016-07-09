// Require
const fs = require('fs');
const moment = require('moment');
const shell = require('shelljs');
const environment = require('./environment.js').env;

// start the docker-compose command for a given site, or for all sites
var start = (site) => {
  let sites = (site && site.substring) ? [].concat(site) : Object.keys(environment.sites);
  let triggerWords = 'Action required';
  let setupActions = [Promise.resolve(true)];
  let buildComposeActions = [Promise.resolve(true)];
  let templateFile = '';

  // step 1 - check the infrastructure for each site is in place; create if needed
  for(let i = 0, iz = sites.length; i < iz; i++){
    let mysite = sites[i];
    let dirCheck = `[ -d compose/dockerfiles/${mysite} ] && echo "Directory exists" || echo ${triggerWords}`;
    shellExec(dirCheck)
    .then((res) => {
      let test = res.trim();
      console.log(`results of directory test: ${res}, test: ${test}, triggerWords: ${triggerWords}`);
      if(test === triggerWords){

        setupActions.push(new Promise((resolve, reject) => {
          shellExec(`mkdir ./compose/dockerfiles/${mysite}`)
          .then((res) => {
            return shellExec(`cp -R ./compose/dockerfiles/site-templates/. ./compose/dockerfiles/${environment.sites[mysite].containerNamespace}/`);
          })
          .then((res) => {
            return shellExec(`mkdir ./${environment.sites[mysite].directoryName}`);
          })
          .then((res) => {
            resolve(true);
          })
          .catch((res) => {
            reject(false);
          });
        }));
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
  }

  Promise.all(setupActions)
  .then((res) => {
    return readFile('./compose/template.yml');
  })
  .then((res) => {
    // step 2 - create a compose yml file for each site
    templateFile = res;
    for(let i = 0, iz = sites.length; i < iz; i++){
      let mysite = sites[i];
      let data = environment.sites[mysite];
      let channel = data.ipChannel;
      let namespace = data.containerNamespace;
      let db = data.database;
      let site0 = `${templatefile}`;
      let site1 = site0.replace(/{{sitename}}/g, namespace);
      let site2 = site1.replace(/{{sitechannel}}/g, channel);
      let site3 = site2.replace(/{{dbuser}}/g, db.user);
      let site4 = site3.replace(/{{dbpass}}/g, db.pass);
      let site5 = site4.replace(/{{dbname}}/g, db.name);
      let site6 = site5.replace(/{{dbrootpass}}/g, db.rootpass);
      let site7 = site6.replace(/{{dbprefix}}/g, db.prefix);
      buildComposeActions.push(new Promise((resolve, reject) => {
        fs.writeFile(`./compose/${namespace}.yml`, site7, 'utf8', (err) => {
          if (err){
            reject(err);
          };
          resolve(true);
        });
      }));
    }
    return Promise.all(buildComposeActions);
  })
  .then((res) => {
    // step 3 - invoke docker-compose
    let cmd = 'docker-compose -f ./compose/main.yml ';
    for (let i = 0, iz = sites.length; i < iz; i++){
      let mysite = sites[i];
      let namespace = environment.sites[mysite].containerNamespace;
      cmd += `-f ./compose/${namespace}.yml `;
    }
    cmd += 'up -d --force-recreate --build';
    console.log(`running command ${cmd}`);
    return shellExec(cmd);
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.start = start;

var shellExec = (command) => {
  if(!command.toLowerCase){
    return Promise.reject(new Error('shellExec error: need to supply a command string'));
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
    return Promise.reject(new Error('containerExec error: need to supply container name'));
  }
  return new Promise((resolve, reject) => {
    shell.exec(`docker exec -i ${container} ${command}`, (code, stdout, stderr) => {
      resolve(stdout);
    });
  });
};

var readFile = (file) => {
  if(!file.toLowerCase){
    return Promise.reject(new Error('readFile error: need to supply a file string'));
  }
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err){
        reject(err);
      };
      resolve(data);
    });
  });
};

var writeFile = (file, data) => {
  if(!file.toLowerCase){
    return Promise.reject(new Error('writeFile error: need to supply a file string'));
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, 'utf8', (err) => {
      if (err){
        reject(err);
      };
      resolve(true);
    });
  });
};

var makeSiteDirectories = (site) => {
  if(!site.toLowerCase){
    return Promise.reject(new Error('makeSiteDirectories error: need to supply a site string'));
  }
  return new Promise((resolve, reject) => {
    shell.exec(`mkdir ./compose/dockerfiles/${site}`)
    .then((res) => {
      return shell.exec(`cp ./compose/dockerfiles/site-templates/. ./compose/dockerfiles/${site}`);
    })
    .then((res) => {
      resolve(true);
    })
    .catch((res) => {
      reject(true);
    });
  });
};

