/*
Key data
- the key for each site can be any name (eg change "site01" as appropriate)
- can have more than one wordpress installation in a site
	- each site will need a different route in nginx
	- for this, changes need to be made to compose/dockerfiles/nginx/default.conf
*/

exports.env = {
	"sites": {
		"site01": {
			"ipChannel": 1,
			"directoryName": "site-01-html",
			"containerNamespace": "site01",
			"backupNamespace": "site01",
			"database": {
				"user": "wordpress",
				"pass": "wordpress",
				"name": "wordpress"
			}
		},
		// "site02": {
		// 	"ipChannel": 2,
		// 	"directoryName": "site-02-html",
		// 	"containerNamespace": "site02",
		// 	"backupNamespace": "site02",
		// 	"database": {
		// 		"user": "wordpress",
		// 		"pass": "wordpress",
		// 		"name": "wordpress"
		// 	}
		// },
	}
};