const cheerio = require('cheerio');

let $ = cheerio.load('<html>');

module.exports = {
	createBreadcrumb: function (uri) {
		let breadcrumb = [];
		let href = '/';
		Array.from(uri.split('/')).forEach(pathname => {
			if (!pathname) { return; }
			href = href + pathname + '/'
			breadcrumb.push({
				name: pathname,
				href: href,
			})
		});
		return breadcrumb;
	},

	listFiles: (pathname) => {
		let res = []
		Object.values(router.routes).forEach(file => {
			if (file.path.startsWith(pathname)) {
				res.push(file);
			}
		});
		return res;
	},

	createElement: (tag, html = '', actions = {}) => {
		let element = $('<' + tag + '/>');
		if (html) element.html(html);
		Object.keys(actions).forEach(key => {
			element[key](actions[key]);
		})
		return $.html(element);
	},
}