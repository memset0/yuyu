const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

module.exports = {
	fs: require('fs'),
	url: require('url'),
	path: require('path'),
	lodash: require('lodash'),
	cheerio: require('cheerio'),

	config: YAML.parse(fs.readFileSync(path.join(__dirname, '../src/config.yml')).toString()),
}