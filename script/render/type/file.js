const fs = require('fs');
const path = require('path');

module.exports = {
	init: ($, pathname, srcRoot) => {
		$.path = pathname = path.normalize(pathname);
		$.uri = path.normalize('/' + path.relative(srcRoot, $.path));
	},

	render: ($) => {
		if (!fs.existsSync($.path)) {
			return { code: 404 };
		} else {
			return {
				code: 200,
				type: 'file',
				res: {
					path: $.path
				}
			};
		}
	}
}