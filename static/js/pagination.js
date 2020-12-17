function replaceGetArguments(src, arg, val) {
  if (src.match(arg + '=([^&]*)')) {
    return src.replace(RegExp('(' + arg + '=)([^&]*)', 'gi'), arg + '=' + val);
  } else if (src) {
    return src + '&' + arg + '=' + val;
  } else {
    return arg + '=' + val;
  }
}

$('#pagination-front a, #pagination-back a').click(function () {
  const page = $(this).text().trim();
  console.log('change to', page, '...');

  window.location.search = replaceGetArguments(window.location.search, 'page', page);
});