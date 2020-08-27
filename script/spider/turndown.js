const TurndownService = require('turndown');
turndownService = new TurndownService({
	codeBlockStyle: 'fenced',
	fence: '```',
});

function turndown(html) {
	text = turndownService.turndown(html);
	text = text
		.replace(/(?<=\$.*)\\\_(?=.*\$)/g, '\_')
		.replace(/(?<=\$.*)\\\[(?=.*\$)/g, '\[')
		.replace(/(?<=\$.*)\\\](?=.*\$)/g, '\]')
		.replace(/(?<=\$.*)\\\\(?=.*\$)/g, '\\')
	return text;
}

module.exports = turndown;