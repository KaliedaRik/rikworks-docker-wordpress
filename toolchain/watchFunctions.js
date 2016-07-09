// Require
const watchr = require('watchr');
const shell = require('shelljs');
const environment = require('./environment.js').env;

var path2container = {};
var container = '';
var file = '';

var start = () => {

  // get current code directory paths
  let cmd = '';
  let mypaths = [];
  let mysites = Object.keys(environment.sites);
  for (let i = 0, iz = mysites.length; i < iz; i++){
    let s = environment.sites[mysites[i]];
    mypaths.push(s.directoryName);
    path2container[s.directoryName] = s.containerNamespace;
  }

  // watchr setup
  watchr.watch({
    paths: mypaths,
    listeners: {
      watching: function(err, watcherInstance, isWatching){
        if (err) {
          console.log(`Watching the path ${watcherInstance.path} failed with error ${err}`);
        } else {
          console.log(`Watching the path ${watcherInstance.path} started`);
        }
      },
      change: function(changeType, filePath, fileCurrentStat, filePreviousStat){
        console.log(`a ${changeType} event occured: ${filePath}`);

        setVars(filePath);

        switch (changeType) {

          case 'delete' :
            // we need to discover if deleted thing is directory or path
            // - can only do this in container, as local version is already deleted
            cmd = `docker exec ${container}-wp [ -d /var/www/html/${file} ] && echo "d" || echo "f"`;
            shellExec(cmd)
            .then((res) => {
              let test = res.trim();
              if(test === 'd'){
                cmd = `docker exec ${container}-wp rm -rf /var/www/html/${file}`;
              }
              else{
                cmd = `docker exec ${container}-wp rm -f /var/www/html/${file}`;
              }
              shellExec(cmd);
            })
            .catch((err) => {
              console.log('delete error: ', err.message);
            });
            break;

          default :
            cmd = `[ -d ${filePath} ] && echo "d" || echo "f"`;
            shellExec(cmd)
            .then((res) => {
              let test = res.trim();
              if(test === 'd'){
                cmd = `docker exec ${container}-wp mkdir /var/www/html/${file}`;
              }
              else{
                cmd = `docker cp ${filePath} ${container}-wp:/var/www/html/${file}`;
              }
              shellExec(cmd);
            })
            .catch((err) => {
              console.log('create/update error: ', err.message);
            });
        }

      },
    }
  });
};
exports.start = start;

var setVars = (filePath) => {
  let parts = filePath.split('/');
  container = path2container[parts[0]];
  parts.splice(0, 1);
  file = parts.join('/');
};

var shellExec = (command) => {
  if(!command.toLowerCase){
    return Promise.reject(new Error('shellExec error: need to supply a command string'))
  }
  return new Promise((resolve, reject) => {
    console.log('running ', command);
    shell.exec(command, (code, stdout, stderr) => {
      resolve(stdout);
    });
  });
};
