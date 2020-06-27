const url = require('url');
const path = require('path');

const { listFiles } = require('./render/index')

let router = {
	root: path.join(__dirname, '../src'),
	routes: {},
	scan: function () {
		let fileList = listFiles(router.root);
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

router.scan();

module.exports = router;