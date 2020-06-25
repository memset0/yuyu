const fs = require('fs');
const lib = require('./types');

class File {
	render(args) {
		if (!lib[this.type].render) { return { code: 403 }; }
		return lib[this.type].render(this, { ...args });
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

module.exports=File;