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
}