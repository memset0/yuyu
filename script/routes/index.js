const express = require('express');
const router = express.Router();

router.get(/^.*$/, function (req, res, next) {
	global.router.scan();
	let data = global.router.data(req);
	if (data.code == 200) {
		if (data.type == 'file') {
			res.sendFile(data.res.path);
		} else if (data.type == 'page') {
			res.render(data.res.template, data.res.arguments);
		}
	} else if (data.code == 301) {
		res.redirect(301, data.res.url);
	} else if (data.code == 302) {
		res.redirect(302, data.res.url);
	} else if (data.code == 404) {
		next();
	} else {
		res.locals.message = 'Render Error: ' + JSON.stringify(data);
		res.locals.error = {};

		res.status(data.code);
		res.render('error');
	}
});

module.exports = router;