const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const source_dir = process.env['YUYU_SOURCE'] || path.join(__dirname, '../src/');
const config = YAML.parse(fs.readFileSync(path.join(source_dir, 'config.yml')).toString());

function readYAMLFile(dir) {
	let text = fs.readFileSync(dir).toString();
	let data = YAML.parse(text);

	return data;
}

module.exports = {
	config: config,

	fs: require('fs'),
	url: require('url'),
	path: require('path'),
	lodash: require('lodash'),
	cheerio: require('cheerio'),
}