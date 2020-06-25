const rd = require('rd');
const pt = require('path');

const File = require('./interface');

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