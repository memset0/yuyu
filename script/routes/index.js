const fs = require('fs');
const url = require('url');
const path = require('path');
const YAML = require('yaml');

const express = require('express');
const router = express.Router();

const config = require('../config');
const { File, listFiles } = require('../render/index');

let route = {};
function scanner() {
	let fileList = listFiles(path.join(__dirname, '../../src'));
	route = {};
	fileList.forEach(file => {
		route[file.uri] = file
	})
}
// console.log(route);

router.get(/^.*$/, function (req, res, next) {
	scanner();
	let parsedUrl = url.parse(req.url);
	let pathname = decodeURI(parsedUrl.pathname);
	if (!Object.keys(route).includes(pathname)) {
		if (Object.keys(route).includes(pathname + '/')) {
			// console.log(parsedUrl);
			res.redirect(302, pathname + '/'); // MARK args??
		} else {
			next(); // not found
		}
		return;
	}

	let data = route[pathname].render(req);
	// console.log(data);

	if (data.code == 200) {
		if (data.type == 'file') {
			res.sendFile(data.res.path);
		} else if (data.type == 'page') {
			res.render(data.res.template, data.res.arguments);
		}
	} else {
		res.locals.message = 'Render Error: ' + JSON.stringify(data);
		res.locals.error = {};

		res.status(data.code);
		res.render('error');
	}
});

module.exports = router;