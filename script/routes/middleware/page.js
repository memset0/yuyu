module.exports = function (req, res, next) {
	if (req.query && req.query.page && !isNaN(parseInt(req.query.page)) && parseInt(req.query.page) >= 1) {
		req.page = parseInt(req.query.page);
		console.log('[page]', req.page);
	}

	next();
};