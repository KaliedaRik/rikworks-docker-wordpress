## Setup - environments
Works on the assumption that environments (local, dev, stage, etc) are namespaced. Each different environment will need its own docker-compose file
- replace NAMESPACE in that file with a more appropriate name
- also update wordpress details and container ports specific for that environment etc

The toolchain functionality relies on the namespace for each environment, and the docker-compose file for that environment, being recorded in the toolchain/environment.js file

## Porting an existing wordpress site to this system
(Being worked out) 

Note: cannot use docker images for the data, as files and database data are stored in persistent volumes (which, despite running in their own containers, do not actually include that data in their images). Instead have to rely on either backup plugins or zipped data files to port the site data over.

> Save this in a local projects folder under a more appropriate name

> Choose a namespace for the development environment, and update
  - docker-compose-development.yml
  - toolchain/environment.js

> Make sure the bash shell is connected to the docker machine (see Toolchain section below), and start the watch task:
$ node toolchain/watch.js

> Fill in the basic details to build a completely new Wordpress site


### Using a backup plugin
(Note: not tested)

> Install the backup plugin into the new wordpress site

> Get the backup files (eg if they're saved into Dropbox) and restore the site 


### Using gzipped mysqldump file and a tar.gz archive of the wordpress files
(archive: everything in the /var/www/html folder of the original site)

> Move the mysqldump file to the database folder

> Move the archive file to the sitestore folder

> Run:
$ node toolchain/site.js restore development [archive-file.tar.gz]
$ node toolchain/database.js restore development [mysqldump-file.sql.gz]


### Localising themes and plugins

> Actively developed themes (or child themes) need to be copied over to the local machine, and placed into local-themes 
$ docker cp [wp-container-name]:/var/www/html/wp-content/themes[theme-folder-name] ./local-themes 

> Similarly, any plugins that will be actively developed need to be copied over to local-plugins
$ docker cp [wp-container-name]:/var/www/html/wp-content/plugins[plugin-folder-name] ./local-plugins

(If any wordpress files outside of the theme and plugins has been changed, then the toolchain files watch.js and watchFunction.js will need to be adapted to handle local coding for those files)


## Toolchain - setup and run
> Use nvm to make sure shell/cli is running a sufficiently advanced version of node - the toolchain uses node v6.0.0+

> Run npm install

> Make sure you have a docker machine created/started and connected to shell - see below

> Create the containers locally by running the appropriate docker-compose command - see below. If this is the first time running in the docker machine, the build will take a little while (running the watch toolchain function should do this automatically)

> Start the toolchain watch process - environment can be one of: 'production', 'stage', 'development' (default)
$ node toolchain/watch.js development

The watch process will capture additions, updates and deletions to files in the local-plugins and local-themes folders, and automatically recreate the changes in the wordpress container/volume

Most work should be done in the local theme (ideally a child theme, but whatever). Locally created/maintained plugins should be added to the local-plugins folder.


### Backup and restore WordPress database from/to containers
(Not tested, but because this uses docker-machine/docker commands should be able to backup and restore to/from local host machine to whichever docker machine is connected, whether it is running in locally in virtualbox or in the cloud with eg AWS)

Backup files can be found in the ./database folder

Backup:
$ toolchain/database.js [command] [environment] [file]
  - toolchain/database.js // will backup the database from the development environment
  - toolchain/database.js backup // will backup the database from the development environment
  - toolchain/database.js backup development
  - toolchain/database.js backup stage
  - toolchain/database.js backup production

Restore:
  - toolchain/database.js restore development filename.sql.gz
  - toolchain/database.js restore stage filename.sql.gz
  - toolchain/database.js restore production filename.sql.gz


### Backup and restore WordPress site files from/to containers
(Again - not tested, but should work wherever the docker machine lives)

Backup files can be found in the ./sitestore folder - warning: multi-MB size files!

Backup:
$ toolchain/site.js [command] [environment] [file]
  - toolchain/site.js // will backup the site folders and files from the development environment
  - toolchain/site.js backup // will backup the site folders and files from development
  - toolchain/site.js backup development
  - toolchain/site.js backup stage
  - toolchain/site.js backup production

Restore:
  - toolchain/site.js restore development filename.tar.gz
  - toolchain/site.js restore stage filename.tar.gz
  - toolchain/site.js restore production filename.tar.gz


## Creating a docker machine for local development
$ docker-machine create --driver virtualbox [name-of-machine]


### Other useful docker-machine commands
$ docker-machine ls
  - lists all available machines
  - can get the ip address of a machine from this list
  - also shows the active machine - ie on which machine docker/docker-compose commands will operate 

$ docker-machine ssh [name-of-machine]
  - for a more interactive experience with a machine

$ docker-machine start [name-of-machine]
  - to start a machine

$ docker-machine stop [name-of-machine]
  - to stop a machine

$ docker-machine restart [name-of-machine]
  - for restarting a machine
  - useful for emulating server restarts

$ docker-machine rm -y [name-of-machine]
  - deleting a local machine


### Making the machine active (connecting the cli/shell to it)
For Mac/linux bash
$ eval $(docker-machine env [name-of-machine])

For Windows powershell
$ docker-machine env [name-of-machine] | Invoke-Expression


## To start containers locally
Make sure you have a docker machine running, and active (ie connected to your cli/shell)
  - docker-compose -f docker-compose-development.yml up -d --force-recreate --build
  - docker-compose -f docker-compose-stage.yml up -d --force-recreate --build
  - docker-compose -f docker-compose-production.yml up -d --force-recreate --build

The watch toolchain function should handle this automatically


## Stopping and restarting containers
To stop and restart the containers, just repeat the docker-compose up command (or, when the watch function is running, add/change/delete a file in ./local-plugins or ./local-themes folders)


## Listing and interacting with containers (and volumes)
Make sure a docker machine is running, and active (ie connected to the cli/shell)


### Useful docker commands:
$ docker ps
  - list all running containers

$ docker ps -a
  - list all containers on machine, this will pick up the persistent volume containers

$ docker images
  - lists all the container images on machine
  - if the images need clearing up, try running (bash cli/shell only; not powershell):
$ docker rmi $(docker images -q --filter "dangling=true")

$ docker logs [name-of-container]
  - to display the main logfile for the container

$ docker exec -it [name-of-container] bash
  - to get an interactive shell directly inside the container
  - container does need to be running!

$ docker inspect [name-of-container]
  - all the info you will ever want to know about the container
  - filtering options are available - see https://docs.docker.com/engine/reference/commandline/inspect/

