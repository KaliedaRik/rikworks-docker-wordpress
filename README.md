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


### staging
$ docker-compose -f dc-stage.yml up -d --force-recreate --build


### production
$ docker-compose -f [docker-compose-file-for-prod-not-yet-written].yml up -d --force-recreate --build


## Stopping and restarting containers
To stop and restart the containers, just repeat the docker-compose up command


## Listing and interacting with containers (and volumes)
Make sure you have a docker machine running, and active (ie connected to your cli/shell)


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

