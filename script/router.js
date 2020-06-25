const url = require('url');
const path = require('path');

const { listFiles } = require('./render/index')

let router = {
	routes: {},
	scan: function () {
		let fileList = listFiles(path.join(__dirname, '../src'));
		router.routes = {};
		fileList.forEach(file => {
			router.routes[file.uri] = file
		})
	},
	data: function (req) {
		let pathname = decodeURI(url.parse(req.url).pathname);
		if (!Object.keys(router.routes).includes(pathname)) {
			if (Object.keys(router.routes).includes(pathname + '/')) {
				return { code: 302, res: { url: pathname + '/' }, };
			} else {
				return { code: 404 };
			}
		}
		return router.routes[pathname].render({
			req: req
		});
	},
};

module.exports = router;