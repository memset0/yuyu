var express = require('express');
var router = express.Router();

router.get('/:keyword', function (req, res, next) {
  let keyword = req.params.keyword;
  let articles = [];

  Object.values(global.router.routes).forEach(file => {
    if (file.type == 'file' || file.type == 'folder') { return; }
    if (file.uri && file.uri.includes(keyword)) {
      console.log(file);
      articles.push(file);
    }
  })

  res.render('archive', {
    title: keyword + ' - 搜索结果',
    articles: articles,
  });
});

module.exports = router;