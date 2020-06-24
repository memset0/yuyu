const fs = require('fs');
const path = require('path');

const { File, listFiles } = require('./render/index')

function bind(app, config) {
	let fileList = listFiles(path.join(__dirname, '..', 'src'));
	fileList.forEach(file => {
		app.get(file.uri, function (req, res, next) {

		})
	})

	if (~config.alive_time) {
		setTimeout(() => {
			bind(app, config);
		}, config.alive_time);
	}
}

module.exports = {
	bind: bind,
}