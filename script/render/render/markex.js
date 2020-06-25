const fs = require('fs');
const url = require('url');
const ejs = require('ejs');
const path = require('path');
const cheerio = require('cheerio');

const marked = require('./marked');
const global = require('../../global');

let $ = cheerio.load('<html>');

function apiFactory(uriRoot, pathRoot) {

	let lib = {
		uriResolve: now => url.resolve(uriRoot, now),
		pathResolve: now => path.resolve(path.join(pathRoot, now)),

		extname: now => path.extname(now) == '' ? '' : path.extname(now).slice(1),

		createElement: (tag, html = '', actions = {}) => {
			let element = $('<' + tag + '/>');
			if (html) element.html(html);
			Object.keys(actions).forEach(key => {
				element[key](actions[key]);
			})
			return $.html(element);
		},

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

		importHtml: (path) => {
			return lib.createElement('iframe', 'Your browser does not support iframes.', {
				attr: {
					'class': 'md-iframe',
					src: lib.uriResolve(path)
				}
			});
		},
		importPDF: (path) => {
			return lib.createElement('iframe', 'Your browser does not support iframes.', {
				attr: {
					'class': 'md-pdf-viewer',
					src: lib.uriResolve(path)
				}
			});
		},
	}

	return lib;
}

module.exports = function (text, uri, path, arguments) {
	let api = apiFactory(uri, path);
	return marked(ejs.render(text, { ...global, ...api, ...arguments }));
}