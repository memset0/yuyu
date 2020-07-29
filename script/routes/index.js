const express = require('express');
const router = express.Router();

const global_arguments = require('../global');


router.get(/^.*$/, function (req, res, next) {
	global.router.scan();

	let data = global.router.data(req);
	if (data.code == 200) {
		if (data.type == 'file') {
			res.sendFile(data.res.path);
		} else if (data.type == 'page') {
			res.render(data.res.template, { ...global_arguments, ...data.res.arguments });
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


router.get('/tag/:tagName', function (req, res) {
	global.router.scan();

	let tagName = req.params.tagName;
	let articles = [];

	Object.values(global.router.routes).forEach(file => {
		if (file.type == 'file' || file.type == 'folder') { return; }
		let config = file.render({ submodule: { config: true } }).res.arguments.article;
		if (config.tag && config.tag.includes(tagName)) {
			articles.push(file);
		}
	});

	res.render('archive', {
		title: tagName + ' - 标签',
		articles: articles,
	});
});


router.get('/search/:keyword', function (req, res, next) {
	global.router.scan();

	let keyword = req.params.keyword;
	let articles = [];

	Object.values(global.router.routes).forEach(file => {
		if (file.type == 'file' || file.type == 'folder') { return; }
		if (file.uri && file.uri.includes(keyword)) {
			articles.push(file);
		}
	});

	res.render('archive', {
		title: keyword + ' - 搜索结果',
		articles: articles,
	});
});


module.exports = router;