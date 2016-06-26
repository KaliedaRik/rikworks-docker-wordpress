// Require
const watchr = require('watchr');
const shell = require('shelljs');
const envFile = require('./environment.js').env;

var env;

// Watch a directory or file
var startWatching = (environment) => {
  env = environment || 'development';

  shellExec('docker ps')
  .then((res) => {
    watchr.watch({
      paths: ['./local-plugins', './local-themes'],
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

          switch (changeType) {

            case 'delete' :
              let command = createDeleteFileCommand(filePath);
              if(command){
                let container = getWordpressContainerName();
                containerExec(container, command)
                .then((res) => {
                  composeExec();
                })
                .catch((err) => {
                  console.log(err.message);
                });
              }
              else {
                console.log(`Processing error: file path incorrect for ${filePath}`);
              }
              break;

            default :
              composeExec()
              .catch((err) => {
                console.log(err.message);
              });
          }
          // switch ends
        }
      }
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
};
exports.startWatching = startWatching;

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
    console.log(`docker exec ${container} bash ${command}`);
    shell.exec(`docker exec ${container} bash ${command}`, (code, stdout, stderr) => {
      if(stderr){
        console.log(stderr);
      }
      resolve(stdout);
    });
  });
};

var composeExec = () => {
  return new Promise((resolve, reject) => {
    console.log(`docker-compose -f ${envFile.composeFile[env]} up -d --force-recreate --build`);
    shell.exec(`docker-compose -f ${envFile.composeFile[env]} up -d --force-recreate --build`, (code, stdout, stderr) => {
      if(stderr){
        console.log(stderr);
      }
      resolve(stdout);
    });
  });
};

var convertPathToWordpressPath = (path) => {
  let file = false;
  if(path.includes('local-plugins')){
    file = `/var/www/html/wp-content/plugins/${path.substr(14)}`;
  }
  else if(path.includes('local-themes')){
    file = `/var/www/html/wp-content/themes/${path.substr(13)}`;
  }
  return file;
};

var createDeleteFileCommand = (path) => {
  let file = convertPathToWordpressPath(path);
  if(file) {
    console.log(`rm -rf ${file}`);
    return `rm -rf ${file}`;
  }
  return false;
};

var getWordpressContainerName = () => {
  return `${envFile.namespace[env]}-wp`;
};
