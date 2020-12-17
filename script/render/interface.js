const fs = require('fs');
const lib = require('./types');

class File {
	read() { return fs.readFileSync(this.path).toString(); }
	readJSON() { return fs.readFileSync(this.path).toJSON(); }
	write(content) { return fs.writeFileSync(this.path, content); }
	writeJSON(content) { return fs.writeFileSync(this.path, JSON.stringify(content)); }

	render(options = null) {
		if (!lib[this.type].render) { return { code: 403 }; }
		if (!options) options = {};
		if (options.options) options = { ...options, ...options.options };
		return lib[this.type].render(this, options);
	}

	constructor(path, { srcRoot, type = undefined }) {
		if (type) {
			this.type = type;
		} else {
			Object.keys(lib).forEach(type => {
				if (lib[type].check && lib[type].check(path)) {
					this.type = type;
					return 0;
				}
			})
			if (!this.type) {
				this.type = fs.statSync(path).isDirectory() ? 'folder' : 'file';
			}
		}

		lib[this.type].init(this, path, srcRoot);
	}
}

module.exports = File;