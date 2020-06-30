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
		articles = lodash.filter(articles, { type: 'markdown' });
		articles = lodash.sortBy(articles, file => {
			let date = file.render({submodule: {config: true}}).res.arguments.article.date;
			return (date ? -parseInt(date.format('x')) : Infinity);
		});
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