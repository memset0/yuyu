const cheerio = require('cheerio');

let $ = cheerio.load('<html>');

const utils = {
	isNumberChar: function(c) {
		return '0'.charCodeAt() <= c.charCodeAt() && c.charCodeAt() <= '9'.charCodeAt();
	},

	createBreadcrumb: function (uri) {
		let breadcrumb = [];
		let href = '/';
		Array.from(uri.split('/')).forEach(pathname => {
			if (!pathname) { return; }
			href = href + pathname + '/'
			breadcrumb.push({
				name: pathname,
				href: href,
			})
		});
		return breadcrumb;
	},

	listFiles: (pathname) => {
		let res = []
		Object.values(router.routes).forEach(file => {
			if (file.path.startsWith(pathname)) {
				res.push(file);
			}
		});
		return res;
	},

	createElement: (tag, html = '', actions = {}) => {
		let element = $('<' + tag + '/>');
		if (html) element.html(html);
		Object.keys(actions).forEach(key => {
			element[key](actions[key]);
		})
		return $.html(element);
	},

	decodeHTML: (content) => {
		return $($('<div>').html(content)).text();
	},

	getProblemLink: (text) => {
		const table = {
			'洛谷': {
				regex: [/^洛谷(\d+)$/, /^洛谷P(\d+)$/i, /^lg(\d+)$/i, /^luogu(\d+)$/i],
				link: (match) => `https://www.luogu.com.cn/problem/P${match[1]}`,
			},
			'LOJ': {
				regex: [/^loj(\d+)$/i, /^LibreOJ(\d+)$/i,],
				link: (match) => `https://loj.ac/problem/${match[1]}`
			},
			'UOJ': {
				regex: [/^uoj(\d+)$/i,],
				link: (match) => `http://uoj.ac/problem/${match[1]}`
			},
			'CF': {
				regex: [/^cf(\d+)([a-z]\d*)$/i],
				link: (match) => `https://codeforces.com/contest/${match[1]}/problem/${match[2]}`
			},
			'GYM': {
				regex: [/^gym(\d+)([a-z]\d*)$/i],
				link: (match) => `https://codeforces.com/gym/${match[1]}/problem/${match[2]}`
			},
			'HDU': {
				regex: [/^hdu(\d+)$/i],
				link: (match) => `http://acm.hdu.edu.cn/showproblem.php?pid=${match[1]}`
			},
			'ZOJ': {
				regex: [/^zoj(\d+)$/i],
				// link: (match) => `http://acm.zju.edu.cn/onlinejudge/showProblem.do?problemCode=${match[1]}`
				link: (match) => `https://vjudge.net/problem/ZOJ-${match[1]}/origin`
			},
			'Virtual Judge': {
				regex: [/^vj-([^-]+)-([^-]+)/i],
				link: (match) => `https://vjudge.net/problem/${match[1]}-${match[2]}`
			}
		}
		text = String(text);
		let result = null;
		try {
			Object.keys(table).forEach(name => {
				if (result) return;
				table[name].regex.forEach(regex => {
					if (result) return;
					let matched = text.match(regex);
					if (matched) {
						result = {
							link: table[name].link(matched, text),
							name: name
						};
					}
				});
			});
		} catch (e) {
			console.error(text);
			console.error(e);
			return null;
		}
		return result;
	},
};

module.exports = utils;