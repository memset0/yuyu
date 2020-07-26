const path = require('path');
const lodash = require('lodash');

const utils = require('../utils');

module.exports = {
	init: ($, pathname, srcRoot) => {
		$.path = pathname = path.normalize(pathname);
		$.uri = path.normalize('/' + path.relative(srcRoot, $.path) + '/');
	},

	render: ($) => {
		let articles = utils.listFiles($.path);
		articles = lodash.filter(articles, o => (o.type != 'file' && o.type != 'folder'));
		articles = articles.map(o => ({ file: o, config: o.render({ submodule: { config: true } }).res.arguments.article }));
		articles = lodash.filter(articles, o => (!o.config.hide));
		articles = lodash.sortBy(articles, o => (o.config.date ? -parseInt(o.config.date.format('x')) : Infinity));
		articles = articles.map(o => o.file);
		return {
			code: 200,
			type: 'page',
			res: {
				template: 'archive',
				arguments: {
					title: $.path == router.root ? '/' : path.basename($.path) + ' - 文件夹',
					articles: articles,
				}
			}
		};
	}
}