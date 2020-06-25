const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const utils = require('../utils');
const render = require('../renders');
const global = require('../../global');

module.exports = {
	check: (pathname) => {
		return (path.extname(pathname) == '.md');
	},

	init: ($, pathname, srcRoot) => {
		$.path = pathname = path.normalize(pathname);
		let dirname = path.dirname($.path);
		if (path.basename($.path) == 'index.md') {
			$.uri = '/' + path.relative(srcRoot, dirname) + '/';
			$.dirPath = dirname;
			$.dirUri = '/' + path.relative(srcRoot, dirname) + '/';
		} else {
			$.uri = '/' + path.relative(srcRoot, path.join(dirname, path.basename($.path, path.extname($.path)))) + '/';
			$.dirPath = dirname;
			$.dirUri = '/' + path.relative(srcRoot, dirname) + '/';
		}
		$.uri = path.normalize($.uri);
		$.dirUri = path.normalize($.dirUri);
		$.dirPath = path.normalize($.dirPath);
	},

	render: ($) => {
		if (!fs.existsSync($.path)) {
			return { code: 404 };
		}

		let text = fs.readFileSync($.path).toString();
		let exec = /^(---+\n(?<article>[\s\S]+?)\n---+\n)?(?<plain>[\s\S]*)$/.exec(text);
		let article = exec && exec.groups.article ? YAML.parse(exec.groups.article) : {};
		let plain = exec && exec.groups.plain ? exec.groups.plain : text;

		article.title = article.title;
		if (!article.title) {
			article.title = pt.basename($.path, pt.extname($.path));
			if (article.title == 'index') { article.title = pt.basename(pt.join($.path, '..')); }
		}

		return {
			code: 200,
			type: 'page',
			res: {
				template: 'article',
				arguments: {
					...global,
					title: article.title + ' - 文章',
					article: {
						...article,
						content: render.markex(plain, $.dirUri, $.dirPath, {
							article: article,
						}),
						breadcrumb: utils.createBreadcrumb($.uri),
					},
				},
			}
		};
	}
}