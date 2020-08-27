const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const superagent = require('superagent');

const turndown = require('../turndown');

const yhx12243Spider = {
	prefix: ['yhx-12243.github.io/OI-transit'],

	spider: async function (url, dir) {
		let name = url.match(/yhx\-12243\.github\.io\/OI\-transit\/records\/(.+)\.html/);
		name = name && name[1] ? name[1].replace('%3b', ',').toLowerCase() : 'noname';

		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			url = 'https://' + url;
		}

		let res = await superagent.get(url);
		let $ = cheerio.load(res.text);

		let data = {
			title: $('html>head>title').text()
				.replace(/\[/g, '「')
				.replace(/\]/g, '」')
				.replace('CodeforcesGym', 'GYM')
				.replace('Codeforces', 'CF')
				.replace('uoj', 'UOJ')
				.replace('loj', 'LOJ')
				.replace('soj', 'StupidOJ')
				.replace('lydsy', 'BZOJ')
				.replace('lg', '洛谷'),
		};

		$('img').each(function () {
			let alt = $(this).attr('alt');
			$(this).attr('alt', 'center|zoom:80%' + (alt ? '|' + alt : ''));

			let src = $(this).attr('src');
			if (!src.startsWith('http://') && !src.startsWith('https://')) {
				$(this).attr('src', 'https://yhx-12243.github.io/OI-transit/records/' + src);
			}
		});

		$('body>h1, body>h2, body>h3, body>h4').each(function () {
			if ($(this).text() == '题目大意') $(this).html('');
			if ($(this).text() == '题目描述') $(this).html('');
			if ($(this).text() == '题解') $(this).text('yhx-12243 的题解');
		});

		// if (data.title == '访问受限提醒') { // SB gfw???
		// 	console.log(res.text);
		// }

		return {
			name: name,
			data: data,
			text: turndown($('body').html()).replace('### yhx-12243 的题解', '\n<!--more-->\n\n### yhx-12243 的题解'),
		};
	},
};

module.exports = yhx12243Spider;

if (require.main == module) {
	const url = 'http://localhost:3000/noname.txt';

	yhx12243Spider.spider(url).then(console.log);
}