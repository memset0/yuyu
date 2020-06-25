const path = require('path');
const lodash = require('lodash');

const utils = require('../utils');

module.exports = {
	init: ($, pathname, srcRoot) => {
		$.path = pathname = path.normalize(pathname);
		$.uri = path.normalize('/' + path.relative(srcRoot, $.path) + '/');
	},

	render: ($) => {
		return {
			code: 200,
			type: 'page',
			res: {
				template: 'archive',
				arguments: {
					title: path.dirname($.path) + ' - 文件夹',
					articles: lodash.filter(utils.listFiles($.path), { type: 'markdown' }),
				}
			}
		};
	}
}