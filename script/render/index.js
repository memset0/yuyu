const fs = require('fs');
const rd = require('rd');
const pt = require('path');
const url = require('url');
const ejs = require('ejs');
const YAML = require('yaml');
const moment = require('moment');

const render = {
	marked: require('./modules/marked'),
	markex: require('./modules/markex'),
};

const global_config = require('../config');

const base_arguments = {
	config: global_config,
}

function createBreadcrumb(uri) {
	// uri = url.normalize(uri);
	let breadcrumb = [];
	let href = '/';
	Array.from(uri.split('/')).forEach(pathname => {
		if (!pathname) { return; }
		href = url.resolve(href, pathname);
		breadcrumb.push({
			name: pathname,
			href: href,
		})
	});
	return breadcrumb;
}

class File {
	render(req = {}) {
		const renderLib = {
			file: () => {
				if (!fs.existsSync(this.path)) {
					return { code: 404 };
				} else {
					return {
						code: 200,
						type: 'file',
						res: {
							path: this.path
						}
					};
				}
			},

			folder: () => ({ code: 403 }),

			markdown: () => {
				if (!fs.existsSync(this.path)) {
					return { code: 404 };
				}

				let text = fs.readFileSync(this.path).toString();
				let exec = /^(---+\n(?<config>[\s\S]+?)\n---+\n)?(?<plain>[\s\S]*)$/.exec(text);
				let config = exec && exec.groups.config ? YAML.parse(exec.groups.config) : {};
				let plain = exec && exec.groups.plain ? exec.groups.plain : text;

				config.title = config.title;
				if (!config.title) {
					config.title = pt.basename(this.path, pt.extname(this.path));
					if (config.title == 'index') { config.title = pt.basename(pt.join(this.path, '..')); }
				}

				return {
					code: 200,
					type: 'page',
					res: {
						template: 'article',
						arguments: {
							...base_arguments,
							title: config.title + ' - 文章',
							article: {
								...config,
								content: render.markex(plain, this.dirUri, this.dirPath, {
									article: config,
								}),
								breadcrumb: createBreadcrumb(this.uri),
							},
						},
					}
				};
			}
		}

		return renderLib[this.type](req);
	}

	constructor(path, { srcRoot, type = undefined }) {
		this.type = type || (fs.statSync(path).isDirectory() ? 'folder' : (pt.extname(path) == '.md' ? 'markdown' : 'file'))
		this.path = path = pt.normalize(path);
		if (this.type == 'folder') {
			this.uri = '/' + pt.relative(srcRoot, path) + '/';
		} if (this.type == 'file') {
			this.uri = '/' + pt.relative(srcRoot, path);
		} else if (this.type == 'markdown') {
			if (pt.basename(path) == 'index.md') {
				this.uri = '/' + pt.relative(srcRoot, pt.dirname(path)) + '/';
				this.dirPath = pt.dirname(path);
				this.dirUri = '/' + pt.relative(srcRoot, pt.dirname(path)) + '/';
			} else {
				this.uri = '/' + pt.relative(srcRoot, pt.join(pt.dirname(path), pt.basename(path, pt.extname(path)))) + '/';
				this.dirPath = pt.dirname(path);
				this.dirUri = '/' + pt.relative(srcRoot, pt.dirname(path)) + '/';
			}
		}
		if (this.uri) { this.uri = pt.normalize(this.uri); }
		if (this.path) { this.path = pt.normalize(this.path); }
		if (this.dirUri) { this.dirUri = pt.normalize(this.dirUri); }
		if (this.dirPath) { this.dirPath = pt.normalize(this.dirPath); }
	}

}

function listFiles(srcRoot) {
	srcRoot = pt.normalize(srcRoot);
	return rd.readSync(srcRoot).map(file => new File(file, { srcRoot }));
}

// console.log(listFiles(pt.join(__dirname, '../../src')));

// listFiles(pt.join(__dirname, '../../src')).forEach(file => {
// 	let dist = pt.join(pt.join(__dirname, '../../dist'), file.uri);
// 	console.log(dist);
// 	if (file.type == 'folder') {
// 		if (!fs.existsSync(dist)) {
// 			fs.mkdirSync(dist);
// 		}
// 	} else if (file.type == 'file') {
// 		fs.createReadStream(file.path).pipe(fs.createWriteStream(dist));
// 	} else if (file.type == 'markdown') {
// 		if (!fs.existsSync(dist)) {
// 			fs.mkdirSync(dist);
// 		}
// 		let rendered = file.renderMarkdown();
// 		fs.writeFileSync(pt.join(dist, 'index.md'), rendered.text);
// 	}
// })

module.exports = {
	File: File,
	listFiles: listFiles,
}