const methods = [
	require('./methods/yhx12243'),
];

module.exports = async function (url) {
	if (url.startsWith('http://')) url = url.slice(7);
	if (url.startsWith('https://')) url = url.slice(8);

	for (let id = 0; id < methods.length; id++) {
		let satisfy = false;
		methods[id].prefix.forEach(prefix => {
			if (url.startsWith(prefix)) satisfy = true;
		});

		if (satisfy) {
			return await methods[id].spider(url);
		}
	}
	return null;
};