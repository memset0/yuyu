const path = require('path');
const lodash = require('lodash');

const utils = require('../utils');

const perPageLimit = 10;

module.exports = {
	init: ($, pathname, source_root) => {
		$.path = pathname = path.normalize(pathname);
		$.uri = path.normalize('/' + path.relative(source_root, $.path) + '/');
	},

	render: ($, options) => {
		let articles = utils.listFiles($.path);
		articles = lodash.filter(articles, o => (o.isPost));
		articles = articles.map(o => ({ file: o, config: o.render({ submodule: ['config'] }).res.arguments.article }));
		articles = lodash.filter(articles, o => (!o.config.hide));
		articles = lodash.sortBy(articles, o => (o.config.date ? -parseInt(o.config.date.format('x')) : Infinity));
		articles = articles.map(o => o.file);

		let multiPageArguments = {};
		if (options.allowMultiPage) {
			const page = options.req.page || 1;
			multiPageArguments = {
				page,
				max_page: Math.ceil(articles.length / perPageLimit),
			}
			articles = articles.slice(perPageLimit * (page - 1), perPageLimit * page);
		}

		return {
			code: 200,
			type: 'page',
			res: {
				template: 'archive',
				arguments: {
					title: $.path == router.root ? '/' : path.basename($.path) + ' - 文件夹',
					articles: articles,
					...multiPageArguments
				}
			}
		};
	}
}