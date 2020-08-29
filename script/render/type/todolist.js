const fs = require('fs');
const path = require('path');

class Todo {
	push_description(text) {
		// console.log([text, this.link]);
		if (!this.link && (text.startsWith('http://') || text.startsWith('https://'))) {
			this.link = text;
			return;
		} else if (!this.link && text.startsWith('href: ')) {
			this.link = text.slice(5);
			return;
		}
		this.description.push(text);
	}

	push_children(item) {
		this.children.push(item);
	}

	constructor(title, { color = null, link = null, preview = null } = more) {
		this.title = title;
		this.link = link;
		this.color = color;
		this.preview = preview;
		this.description = [];
		this.children = [];
	}
}

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
		let root = new Todo(path.basename($.path, path.extname($.path)), {});
		let stack = [root];
		let error_message = [];

		text.split('\n').forEach((line, index) => {
			let depth = 0;
			while (true) {
				depth++;
				if (line.length >= 4 && line.slice(0, 4) == '    ') {
					line = line.slice(4);
				} else if (line.length >= 1 && line[0] == '\t') {
					line = line.slice(1);
				} else {
					break;
				}
			}

			let is_todoitem = line.length > 3 && line[0] == '[' && line[2] == ']' &&
				(line[1] == ' ' || line[1] == '-' || line[1] == 'o' || line[1] == 'x');
			if (is_todoitem) {
				if (depth > stack.length + 1) {
					error_message.push(index);
					return;
				}

				let title;
				let item = {};

				let status = line[1];
				switch (status) {
					case 'x': item.color = 'green'; break;
					case '-': item.color = 'red'; break;
					case 'o': item.color = 'yellow'; break;
					case ' ': item.color = 'black'; break;
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
					title = rendered.res.arguments.article.title;
					item.link = content;
					item.preview = rendered.res.arguments.article.content;
				} else {
					title = content;
				}

				while (stack.length > depth) {
					stack.pop();
				}
				if (stack.length == depth) {
					// console.log(title);

					let now = new Todo(title, item);
					stack[depth - 1].push_children(now);
					stack.push(now);
				} else {
					error_message.push(index);
					return;
				}

			} else {
				--depth;
				if (depth >= stack.length) {
					error_message.push(index);
					return;
				}

				if (index == 0 && depth == 0) {
					root.title = line;
					
				} else {
					while (stack.length > depth + 1) {
						stack.pop();
					}
					stack[depth].push_description(line);
				}
			}
		});

		return {
			code: 200,
			type: 'page',
			res: {
				template: 'todolist',
				arguments: {
					title: root.title + ' - TodoList',
					todo: root,
					source_text: text,
					error_mesage: error_message,
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