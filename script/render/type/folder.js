const path = require('path');

module.exports = {
	init: ($, pathname, srcRoot) => {
		$.path = pathname = path.normalize(pathname);
		$.uri = path.normalize('/' + path.relative(srcRoot, $.path) + '/');
	},
}