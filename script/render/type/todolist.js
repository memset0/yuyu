const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const moment = require('moment');

const utils = require('../utils');
const render = require('../renders');
const config = require('../../global').config;

module.exports = {
	check: (pathname) => {
		return (path.extname(pathname) == '.todo');
	},

	init: ($, pathname, source_root) => {
		$.path = pathname = path.normalize(pathname);
		let dirname = path.dirname($.path);
		if (path.basename($.path) == 'index.todo') {
			$.uri = '/' + path.relative(source_root, dirname) + '/';
			$.dirPath = dirname;
			$.dirUri = '/' + path.relative(source_root, dirname) + '/';
		} else {
			$.uri = '/' + path.relative(source_root, path.join(dirname, path.basename($.path, path.extname($.path)))) + '/';
			$.dirPath = dirname;
			$.dirUri = '/' + path.relative(source_root, dirname) + '/';
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

		let title = path.basename($.path, path.extname($.path));
		let todolist = [];

		text.split('\n').forEach((line, index) => {
			if (line && line.length > 3 && line[0] == '[' && line[2] == ']') {
				let item = {};

				let status = line[1];
				switch (status) {
					case 'x': item.color = 'green'; break;
					case '-': item.color = 'red'; break;
					case ' ': item.color = 'black'; break;
					default: item.color = 'yellow'; break;
				}

				let content = line.slice(4);
				let file = null;
				if (Object.keys(router.routes).includes(content)) {
					file = router.routes[content];
				} else if (Object.keys(router.routes).includes(content + '/')) {
					file = router.routes[content + '/'];
				}
				if (file) {
					let rendered = file.render({ submodule: ['config', 'summary'] })
					item.link = content;
					item.content = rendered.res.arguments.article.title;
					item.preview = rendered.res.arguments.article.content;
				} else {
					item.content = content;
				}

				todolist.push(item);
				// console.log(item);
			} else if (index == 0) {
				title = line;
			}
		});

		return {
			code: 200,
			type: 'page',
			res: {
				template: 'todolist',
				arguments: {
					title: title + ' - TodoList',
					todo: {
						title: title,
						list: todolist,
					}
				},
			}
		};
	}
};

// if (require.main == module) {
// 	global.router = require('../../router')
// 	global.router.scan();
// 	console.log(module.exports.render({ path: '/Users/memset0/Git/yuyu/src/咕咕/yhx12243/todo.todo' }))
// }