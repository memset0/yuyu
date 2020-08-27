const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const router = require('./router');
const config = require('./global').config;

const commandLineTools = {
	edit: function (uri) {
		if (!uri.startsWith('/')) uri = '/' + uri;
		if (!uri.endsWith('/')) uri = uri + '/';

		if (!Object.keys(router.routes).includes(uri)) {
			console.log('No such uri!');
			return;
		}

		let file = router.routes[uri];
		exec(config.command.edit.replace(/%s/g, file.path));
	}
};

module.exports = commandLineTools;