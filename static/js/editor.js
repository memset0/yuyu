(function () {
	let text = decodeURIComponent(__yuyu_editor_text)
		.replace(/&#39;/g, '\'');
	let data = JSON.parse(decodeURIComponent(__yuyu_editor_data));
	let { type, uri } = data;

	$('#editor-submit').click(function () {
		text = monaco_editor.getValue();

		// console.log('data: ', data);
		// console.log('text: ', text);
		$.post('/edit', {
			text: text,
			type: type,
			uri: uri,
		}, function () {
			window.location.href = uri;
		});
	})
})();