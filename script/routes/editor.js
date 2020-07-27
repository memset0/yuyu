const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');

const config = require('../global').config;

if (config.option.allow_edit) {
	router.get('/', function (req, res) {
		let uri = req.query.p;
		let success = false;
		let data = {};
		Object.values(global.router.routes).forEach(file => {
			if (!success && file.type == 'markdown' && file.uri == uri) {
				let text = fs.readFileSync(file.path).toString();

				success = true;
				data = {
					type: 'post',
					text: text,
					uri: uri
				}
			}
		});
		res.render('editor', {
			title: '编辑器',
			success: success,
			data: data,
		});
	});
}

if (config.option.allow_edit) {
	router.post('/', function (req, res) {
		let text = req.body.text;
		let type = req.body.type;
		let uri = req.body.uri;
		
		let success = false;
		
		if (type == 'post') {
			Object.values(global.router.routes).forEach(file => {
				if (!success && file.type == 'markdown' && file.uri == uri) {
					success = true;
					fs.writeFileSync(file.path, text);
				}
			});
		}

		res.json({
			code: 200,
			success: success,
		});
	});
}

module.exports = router;