const fs = require('fs');
const rd = require('rd');
const ejs = require('ejs');
const path = require('path');
const YAML = require('yaml');
const chalk = require('chalk');
const { requireLanguage } = require('highlight.js');

// register global arguments
global.source_dir = process.env['YUYU_SOURCE'] || path.join(__dirname, '../src/');
global.status = 'offline';
global.router = require('./router')
global.config = YAML.parse(fs.readFileSync(path.join(source_dir, 'config.yml')).toString());

// static files api
const static = (function () {
	let root = path.join(__dirname, '../static');
	let api = {
		list: function () {
			return rd.readFileSync(root).map(target => ({
				path: target,
				uri: path.join('/', path.relative(root, target)).replace(/\\/g, '/'),
			}));
		},
	};

	return api;
})();

// dist files api
const dist = (function () {
	let root = process.env['YUYU_DIST'] || path.join(__dirname, '../dist');
	let api = {
		makedirs: function (target) {
			fs.mkdirSync(target, { recursive: true });
		},
		copyFileFrom: function (target, source) {
			target = path.join(root, target);
			api.makedirs(path.dirname(target));
			fs.copyFileSync(source, target);
		},
		writeFile: function (target, content) {
			target = path.join(root, target);
			api.makedirs(path.dirname(target));
			fs.writeFileSync(target, content);
		},
	};

	api.makedirs(root);
	return api;
})();

ejs.compileFile = function(filePath, options) {
	let templatePath = filePath;
	if (options && options.root) templatePath = path.resolve(options.root, templatePath);
	const templateStr = ejs.fileLoader(templatePath, 'utf8');
	options = Object.assign({ filename: templatePath }, options);
	return ejs.compile(templateStr, options);
}

module.exports = function() {
	let template = {};

	static.list().forEach(file => {
		dist.copyFileFrom(file.uri, file.path);
		console.log(chalk.yellow('[static file]') + ' /' + path.relative(router.root, file.path) + chalk.yellowBright(' => ') + file.uri);
	});
	Object.values(router.routes).forEach(file => {
		let data = file.render();
		if (data.code != 200) {
			console.error(chalk.red('[error' + data.code + ']') + ' ' + file.path);
			return;
		}
		if (data.type == 'file') {
			dist.copyFileFrom(file.uri, file.path);
			console.log(chalk.blue('[file]') + ' /' + path.relative(router.root, file.path) + chalk.yellowBright(' => ') + file.uri);
		} else if (data.type == 'page') {
			if (!template[data.res.template]) {
				template[data.res.template]= ejs.compileFile(path.join(__dirname, '../views/', data.res.template + '.ejs'));
			}
			dist.writeFile(file.uri + 'index.html', template[data.res.template]({ ...data.res.arguments }));
			console.log(chalk.green('[page]') + ' /' + path.relative(router.root, file.path) + chalk.yellowBright(' => ') + file.uri + 'index.html');
		}
	})
}

if (require.main == module) {
	module.exports();
}