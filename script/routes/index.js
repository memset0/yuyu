const express = require('express');
const router = express.Router();

const path = require('path');

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
		if (!file.isPost) { return; }
		let config = file.render({ submodule: ['config'] }).res.arguments.article;
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

	let keyword = decodeURIComponent(req.params.keyword);
	let keywordRegExp = new RegExp(keyword, 'i');
	let articles = [];
	let unsortedArticles = [];

	Object.values(global.router.routes).forEach(file => {
		if (!file.isPost) { return; }
		let config = file.render({ submodule: ['config'] }).res.arguments.article;
		let key = 0;
		if (file.uri && file.uri.match(keywordRegExp)) {
			key += 1000;
		}
		if (config.title && config.title.match(keywordRegExp)) {
			key += 900;
		}
		// console.log(config.title);
		if (key) {
			unsortedArticles.push({ file: file, key: key });
		}
	});

	// console.log(keyword);

	articles = unsortedArticles
		.sort((a, b) => {
			if (a.key != b.key) return a.key - b.key;
		})
		.map((pair) => (pair.file));
	console.log(articles.length);

	res.render('archive', {
		title: keyword + ' - 搜索结果',
		articles: articles,
	});
});


router.get('/timeline', function (req, res, next) {
	let articles = [];

	Object.values(global.router.routes).forEach(file => {
		if (!file.isPost) { return; }
		let config = file.render({ submodule: ['config'] }).res.arguments.article;
		if (config.hide || !config.date) { return; }
		articles.push(config);
	});
	articles = articles.sort(function (a, b) {
		return b.date.format('x') - a.date.format('x');
	});

	res.render('timeline', {
		title: '时间轴',
		articles: articles,
	})
});


module.exports = router;