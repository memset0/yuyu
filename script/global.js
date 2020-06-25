const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

module.exports = {
	lodash: require('lodash'),
	cheerio: require('cheerio'),

	config: YAML.parse(fs.readFileSync(path.join(__dirname, '../src/config.yml')).toString()),
}