const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

function readYAMLFile(dir) {
	let text = fs.readFileSync(dir).toString();
	let data = YAML.parse(text);

	return data;
}

module.exports = {
	fs: require('fs'),
	url: require('url'),
	path: require('path'),
	lodash: require('lodash'),
	cheerio: require('cheerio'),

	config: readYAMLFile(path.join(__dirname, '../src/config.yml')),
}