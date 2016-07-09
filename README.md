## For a new wordpress site

Choose a namespace for the site (alphanumeric, no spaces)

Create a folder and download these files into it, cd into folder

Open a terminal and cd to folder. Make sure you are running node v6 (install nvm if necessary and download node v6.0.0 or later)

> nvm use v6.0.0

> npm install

(Assuming docker, docker compose, docker machine already installed locally)

Create a local docker machine to host the docker containers

> docker-machine create --driver virtualbox [namespace]-machine

> eval $(docker-machine env [namespace]-machine)

Update the environment file with the site's namespace:
  - ./toolchain/environment.js
  	- if the site's ipChannel value is changed, will also need to update:
  	- ./compose/dockerfiles/nginx/default.conf

Build the site's containers:

> node toolchain/start.js

(this will take quite a while the first time it runs on a new machine; subsequent invocations should be a lot quicker)

Should now be in a position to point the browser to the site's setup page. To get the ip address:

> docker-machine ls

### Developing the site via CMS

When making changes/updates to the site's codebase via the browser CMS, changes should be immediate, and persistent (they should be able to survive a "docker-machine restart [namespace]-machine" command - a good test to make sure the containerised volumens are working)

To pull changes over to the local machine, delete all the contents in the site's local html folder, and run:

> node toolchain/site.js get [namespace]

To get a backup of the site files (will be stored in ./sitestore folder), or to restore site files from backup:

> node toolchain/site.js backup [namespace]

> node toolchain/site.js restore [namespace] [file.tar.gz]

To get a backup of the site database (will be stored in ./database folder), or to restore site database from backup:

> node toolchain/database.js backup [namespace]

> node toolchain/database.js restore [namespace] [file.sql.gz]

### Developing the site locally

When the site is setup, the code creates a local folder (name defined in ./toolchain/environment.js) to hold the sites files. The toolchain includes functionality to watch this folder for file changes, and to reflect local changes in the container's code. To get this functionality working:

> node toolchain/site.js get [namespace]

> node toolchain/watch.js

Be aware that the default toolchain does not include any functionality beyond this. The toolchain can be extended (eg adding linters, scss preprocessing, etc) in the normal ways, either by including the tool of choice in the build, or by extending the toolchain itself (it uses node/npm modules, so is easily extendible - the watch functionality can be found in ./toolchain/watchFunctions.js)

Choosing a build system:
http://jamesknelson.com/which-build-system-should-i-use-for-my-javascript-app/

## For porting an existing Wordpress site into this structure

(to be investigated)
https://codex.wordpress.org/Moving_WordPress
https://www.smashingmagazine.com/2013/04/moving-wordpress-website/

## Additional information

### Git

By default, the .gitignore file has been set up to ignore files stored in ./database and ./sitestore (ie, all site and database backups)

### docker-compose files

The docker-compose .yml files can be found in the ./compose folder. Each site gets its own file, regenerated each time "node toolchain/start.js" is invoked

A site's Dockerfiles can be found in its ./compose/dockerfiles/[namespace] folder; this system generates 4 containers for each site:
  - [namespace]-wp 			// wordpress site served by Apache
  - [namespace]-wp-data 	// wordpress site files in a containerised volume 
  - [namespace]-db 			// mysql database - each wordpress install gets its own
  - [namespace]-db-data 	// database data in a containerised volume

### Nginx

The system also uses Nginx as a reverse proxy server - to cope with sites which include multiple wordpress installations. The Nginx Dockerfiles can be found in ./compose/dockerfiles/nginx

To change the Nginx configuration, edit the ./compose/dockerfiles/nginx/default.conf file

### Docker images

The system generates fresh images each time the start command is run. The start command (which includes a "docker-compose up" command) can be run at any time.

> node toolchain/start.js

These images are tagged as 'latest'

### PHP

Functionality to change the php.ini file has not yet been included in this system. Files caan be created locally and copied manually to the container using this command:

> docker cp [path-to-local-source] [namespace]-wp:[path-to-container-destination]

Note: reverse the source and destination values to copy files from the container over to the local system. See https://docs.docker.com/engine/reference/commandline/cp/ for details.

