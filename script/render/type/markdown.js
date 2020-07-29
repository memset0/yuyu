const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const moment = require('moment');

const utils = require('../utils');
const render = require('../renders');
const config = require('../../global').config;

module.exports = {
	check: (pathname) => {
		return (path.extname(pathname) == '.md');
	},

	init: ($, pathname, source_root) => {
		$.path = pathname = path.normalize(pathname);
		let dirname = path.dirname($.path);
		if (path.basename($.path) == 'index.md') {
			$.uri = '/' + path.relative(source_root, dirname) + '/';
			$.dirPath = dirname;
			$.dirUri = '/' + path.relative(source_root, dirname) + '/';
		} else {
			$.uri = '/' + path.relative(source_root, path.join(dirname, path.basename($.path, path.extname($.path)))) + '/';
			$.dirPath = dirname;
			$.dirUri = '/' + path.relative(source_root, dirname) + '/';
		}

		$.uri = path.normalize($.uri);
		$.dirUri = path.normalize($.dirUri);
		$.dirPath = path.normalize($.dirPath);

		$.isPost = true;
	},

	render: ($, options) => {
		if (!fs.existsSync($.path)) {
			return { code: 404 };
		}

		if (!options) options = {};
		if (!options.submodule) options.submodule = { config: true, complete: true, summary: false, breadcrumb: true };

		let text = fs.readFileSync($.path).toString().replace(/\r\n/g, '\n');
		let exec = /^(---+\n(?<article>[\s\S]+?)\n---+\n)?(?<plain>[\s\S]*)$/.exec(text);

		let data = {};
		let article = exec && !exec.groups.article ? {} :
			YAML.parse(exec.groups.article.replace(/\t/g, '  '));
		let plain = exec && exec.groups.plain ? exec.groups.plain : text;

		data = {
			path: $.path,
			uri: $.uri,
		};

		if (options.submodule.config) {

			if (!article.title) {
				article.title = path.basename($.path, path.extname($.path));
				if (article.title == 'index') { article.title = path.basename(path.join($.path, '..')); }
			}

			if (article.date) {
				article.date = moment(article.date);
			}

			if (article.link || article.plink) {
				let link = article.link || article.plink;
				if (link != 'disable' && link != 'none' && link != 'null') {
					let data = utils.getProblemLink(link);
					if (data) {
						article.link = data.link;
						article.linkName = data.name;
					} else {
						article.link = link;
						article.linkName = article.link_name || article.linkName || 'Link';
					}
				}
			} else {
				let link = path.basename($.uri);
				let data = utils.getProblemLink(link);
				if (data) {
					article.link = data.link;
					article.linkName = data.name;
				}
			}

			if (Object.keys(article).includes('allow_edit')) {
				article.allow_edit = article.allow_edit ? true : false;
			} else {
				article.allow_edit = global.status == 'online' && config.option.allow_edit;
			}

			data = {
				...data,
				...article
			};
		}

		if (options.submodule.complete) {
			data = {
				...data,
				content: render.markex(plain, $.dirUri, $.dirPath, {
					article: article,
				}),
			};
		}

		if (options.submodule.summary) {
			let summary_plain = plain;
			summary_plain = summary_plain.split('<!--more-->')[0];
			summary_plain = summary_plain.split('<!-- more -->')[0];
			data = {
				...data,
				content: render.markex(summary_plain, $.dirUri, $.dirPath, {
					article: article,
				}),
			}
		}

		if (options.submodule.breadcrumb) {
			data = {
				...data,
				breadcrumb: utils.createBreadcrumb($.uri),
			};
		}

		return {
			code: 200,
			type: 'page',
			res: {
				template: 'article',
				arguments: {
					title: article.title + ' - 文章',
					article: data,
				},
			}
		};
	}
};