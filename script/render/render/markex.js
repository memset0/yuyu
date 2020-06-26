const fs = require('fs');
const url = require('url');
const ejs = require('ejs');
const path = require('path');
const YAML = require('yaml');
const cheerio = require('cheerio');

const marked = require('./marked');
const utils = require('../utils');
const global = require('../../global');

let $ = cheerio.load('<html>');

function apiFactory(uriRoot, pathRoot) {
	uriRoot = path.normalize(uriRoot);
	pathRoot = path.normalize(pathRoot);

	let lib = {
		uriResolve: now => url.resolve(uriRoot, now),
		pathResolve: now => path.resolve(path.join(pathRoot, now)),

		extname: now => path.extname(now) == '' ? '' : path.extname(now).slice(1),

		listFiles: () => utils.listFiles(pathRoot),

		includePlain: (path) => {
			return fs.readFileSync(lib.pathResolve(path));
		},
		includeBuffer: (path) => {
			return new Buffer(fs.readFileSync(lib.pathResolve(path)), 'binary');
		},
		includeCode: (path, language = '') => {
			if (language === '') {
				language = lib.extname(path);
			}
			return '\n' + '```' + language + '\n' + lib.includePlain(path) + '\n' + '```' + '\n';
		},
		includeImage: (path) => {
			let $ = cheerio.load('<img>');
			let base64 = lib.includeBuffer(path).toString('base64');
			$.attr({
				src: 'data:image/' + lib.extname(path) + ';base64,' + base64,
			});
			return $.html();
		},

		importHtml: (path, { width = null, height = null } = {}) => {
			return utils.createElement('iframe', 'Your browser does not support iframes.', {
				attr: {
					'class': 'md-iframe',
					src: lib.uriResolve(path),
					width: width || 400,
					height: height || 300,
				}
			});
		},
		importPDF: (path, { width = null, height = null } = {}) => {
			return utils.createElement('iframe', 'Your browser does not support iframes.', {
				attr: {
					'class': 'md-pdf-viewer',
					src: lib.uriResolve(path),
					width: width || 400,
					height: height || 300,
				}
			});
		},
		importOnedriveFile: (url, { width = null, height = null } = {}) => {
			return utils.createElement('iframe', 'Your browser does not support iframes.', {
				attr: {
					'class': 'md-iframe-onedrive',
					src: url,
					width: width || 400,
					height: height || 300,
					frameborder: 0,
					scrolling: 'no',
				}
			});
		}
	}

	return lib;
}

const extraMarkdownRender = {
	image: text => text.replace(/!\[(.*?)\]\((.*?)\)/g, function (match, config, url, offset, string) {
		if (!config.includes(':')) {
			return match;
		}
		try {
			let data = YAML.parse(config.replace('|', '\n').replace(':', ': '));
			let element = $(`<img src=${url}>`);

			// width & height
			if (data.width) { element.css('width', data.width); }
			if (data.height) { element.css('height', data.height); }
			if (data.min_width || data['min-width']) { element.css('min-width', data.min_width || data['min-width']); }
			if (data.max_width || data['max-width']) { element.css('max-width', data.max_width || data['max-width']); }
			if (data.min_height || data['min-height']) { element.css('min-height', data.min_height || data['min-height']); }
			if (data.max_height || data['max-height']) { element.css('max-height', data.max_height || data['max-height']); }

			// custom settings
			element.css('display', 'block');
			element.css('margin', 'auto');
			if (data.line) { element.css('height', data.line * 1.5 + 'em')}

			// render html
			return $.html(element);
		} catch {
			// catch error => return plain text
			return match;
		}
	}),

}

module.exports = function (text, uri, path, arguments) {
	let api = apiFactory(uri, path);
	text = ejs.render(text, { ...global, ...api, ...arguments });
	text = extraMarkdownRender.image(text);
	text = marked(text)
	return text;
}

// console.log(extraMarkdownRender.image('![height](htttps://memset0.cn)'))
// console.log(extraMarkdownRender.image('![height:1em](htttps://memset0.cn)'))