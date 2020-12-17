const url = require('url');
const path = require('path');

const config = require('./global').config;
const { listFiles } = require('./render/index');

const retiredTimeLimit = 1000 * 30; // 30 seconds

let router = {
	root: process.env['YUYU_SOURCE'] || path.join(__dirname, '../src'),
	routes: {},
	lastScanTime: -1,

	scan: function () {
		if (Date.now() - this.lastScanTime <= retiredTimeLimit) {
			return;
		}

		let fileList = listFiles(router.root);
		router.routes = {};
		fileList.forEach(file => {
			let satisify = true;
			file.path.split('/').forEach(part => {
				satisify &= !config.ignore.includes(part);
			});
			if (satisify) {
				if (file.uri) file.uri = file.uri.replace(/\\/g, '/');
				if (file.dirUri) file.dirUri = file.dirUri.replace(/\\/g, '/');
				router.routes[file.uri] = file;
			}
		});

		this.lastScanTime = Date.now();
	},

	data: function (req, options) {
		let pathname = decodeURI(url.parse(req.url).pathname);

		if (!Object.keys(router.routes).includes(pathname)) {
			if (Object.keys(router.routes).includes(pathname + '/')) {
				return { code: 302, res: { url: pathname + '/' }, };
			} else {
				return { code: 404 };
			}
		}
		return router.routes[pathname].render({
			req: req,
			options: options
		});
	},

};

router.scan();

module.exports = router;
