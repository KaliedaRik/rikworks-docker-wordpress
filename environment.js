exports.env = {
	"namespace": {
		"development":"test1",
		"stage": "NAMESPACE",
		"production": "NAMESPACE"
	},
	"composeFile": {
		"development":"docker-compose-development.yml",
		"stage": "docker-compose-stage.yml",
		"production": "docker-compose-production.yml"
	}
};
