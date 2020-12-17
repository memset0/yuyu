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
		includeImage: (path, alt = '') => {
			let $ = cheerio.load('<img>');
			let base64 = lib.includeBuffer(path).toString('base64');
			$('img').attr({
				src: 'data:image/' + lib.extname(path) + ';base64,' + base64,
				alt: alt
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
					src: '/lib/pdfjs/web/viewer.html?file=' + encodeURIComponent(lib.uriResolve(path)),
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

const extra = {
	image: function ($) {
		$('img').each(function () {
			if (!this || !$(this).attr('alt')) {
				return;
			}
			$(this).attr('alt').split(/\s*\|\s*/g).map(o => o.split(/:\s*/)).forEach(line => {
				if (line.length == 1) {
					let key = line[0];
					if (key == 'half') { $(this).css({ zoom: '50%' }); }
					if (key == 'center' || key == 'centroid') { $(this).css({ display: 'block', margin: 'auto' }); }
				} else if (line.length == 2) {
					let key = line[0], value = line[1];
					if (key == 'zoom') { $(this).css({ zoom: value }); }
					if (key == 'width') { $(this).css({ width: value }); }
					if (key == 'height') { $(this).css({ height: value }); }
					if (key == 'min-width' || key == 'min_width') { $(this).css({ 'min-width': value }); }
					if (key == 'max-width' || key == 'max_width') { $(this).css({ 'max-width': value }); }
					if (key == 'min-height' || key == 'min_height') { $(this).css({ 'min-height': value }); }
					if (key == 'max-height' || key == 'max_height') { $(this).css({ 'max-height': value }); }
					if (key == 'line') { $(this).css({ 'max-height': value * 1.5 + 'em', 'max-width': '100%' }); }
				}
			})
		});
		return $;
	},

}

module.exports = function (text, uri, path, arguments) {
	let api = apiFactory(uri, path);
	text = ejs.render(text, { ...global, ...api, ...arguments });
	text = marked(text)

	let $ = cheerio.load(text);
	extra.image($);

	return $.html();
};

// (function () {
// 	let $ = cheerio.load('<html><img alt="line: 7 |center"></html>');
// 	extra.image($);
// 	console.log($.html());
// })();