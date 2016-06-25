# An example of creating and adding a child theme to a dockerised WordPress installation

Note - this is just a test theme, it doesn't do anything

Adding or amending files in this child theme - these should be automatically copied over to the dockerised site each time docker-compose up is run

TODO:
- an improvement would be to add the docker-compose command to a watch task (for instance when using node.js as the toolchain, add something like this to the node toolchain: https://github.com/bevry/watchr ...)

### Deleting files locally will not (yet) delete files in the container:
- need to work out a solution for this
- don't want to just delete everything in wp-content/themes and wp-content/plugins, then rebuild as this will lose plugins added via the CMS
- need to work out a way for the build to identify just the local plugins and themes, so these can be deleted from the container before updated content is copied over during the build
- current fix is to go into the container and manually delete the local themes/plugins before doing docker-compose up command ...

> docker exec -it NAMESPACE-wp bash
$ ls -la /var/www/html/wp-content/themes
$ rm -rf /var/www/html/wp-content/themes/name-of-a-local-theme-that-needs-updating
$ ls -la /var/www/html/wp-content/plugins
$ rm -rf /var/www/html/wp-content/plugins/name-of-a-local-plugin-that-needs-updating
$ exit
> docker-compose -f [name of compose file].yml up -d --force-recreate --build

- these instructions could be automated into a (node.js) toolchain with something like https://github.com/bevry/watchr, which will trigger an event when it detects a file deletion ...
