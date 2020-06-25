const marked = require('marked');

// const renderLaTeX = (function () {
// 	if (!config.mathjax.enable) {
// 		return function (content) { return content; };
// 	}

// 	const { mathjax } = require('mathjax-full/js/mathjax');
// 	const { TeX } = require('mathjax-full/js/input/tex-full');
// 	const { SVG } = require('mathjax-full/js/output/svg');
// 	const { LiteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor');
// 	const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html');
// 	const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages');

// 	const adaptor = new LiteAdaptor();
// 	RegisterHTMLHandler(adaptor);

// 	const tex = new TeX({
// 		packages: AllPackages,
// 		inlineMath: [['$', '$'], ['\\(', '\\)']],
// 		displayMath: [['$$', '$$'], ['\\[', '\\]']], // MARK BUG: cannot be rendered in display-mode.
// 		// processEscapes: true,
// 	});
// 	const svg = new SVG({
// 		// fontCache: 'none'
// 	});

// 	return function (content) {
// 		const html = mathjax.document(content, {
// 			InputJax: tex,
// 			OutputJax: svg
// 		});

// 		html.render();
// 		return adaptor.innerHTML(adaptor.body(html.document));
// 	}
// })();

// const renderLaTeX = function (content) {
// 	return content + `
// <style>.MathJax:focus {outline: none;}</style>
// <script type="text/x-mathjax-config">
// MathJax.Hub.Config({
// 	extensions: ["tex2jax.js"],
// 	jax: ["input/TeX","output/HTML-CSS"],
// 	"fast-preview": {disabled: true},
// 	tex2jax: {inlineMath:[ ["$", "$"] ],displayMath:[ ["$$","$$"] ],processEscapes: true},
// 	"HTML-CSS": { availableFonts: ["TeX"] }
// });
// </script>
// <script type="text/javascript" src="//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
// 	`;
// }

const renderLaTeX = (function () {
  const katex = require('katex');

  const specialCharacters = ['<', '>']

  const render = function (content, display) {
    return katex.renderToString(content, {
      displayMode: display,
      throwOnError: false
    });
  };

  const renderText = function (content, openFlag, closeFlag, display) {
    let result = '', stack = '';
    Array.from(content).forEach(char => {
      stack += char;
      if (specialCharacters.includes(char) || (stack.length <= openFlag.length && !openFlag.startsWith(stack))) {
        result += stack, stack = '';
      } else if ((stack.length > closeFlag.length && stack.endsWith(closeFlag))) {
        result += render(stack.slice(openFlag.length, -closeFlag.length), display), stack = '';
      }
    });
    return result + stack;
  };

  return function (content) {
    content = renderText(content, '$$', '$$', true);
    content = renderText(content, '$', '$', false);
    // content = renderText(content, '\\[', '\\]', true);
    // content = renderText(content, '\\(', '\\)', false);
    return content;
  }
})();

const renderSemanticUI = (function () {
  const cheerio = require('cheerio');

  return function (content) {
    let $ = cheerio.load(content);

    // style for table
    $('table').addClass('ui celled table');

    // code highlight
    if ($('pre code').length) {
      $($('pre code')[0])
        .append(`<link rel="stylesheet" href="/lib/highlight/tomorrow.css">
			           <script src="/lib/highlight/highlight.min.js"></script>
			           <script>hljs.initHighlightingOnLoad();</script>`)
    }
    
    return $.html();
  };
})();

module.exports = function (content) {
  content = renderLaTeX(content);
  content = marked(content);
  content = renderSemanticUI(content);

  return content;
};