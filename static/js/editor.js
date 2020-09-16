(function () {
	let text = decodeURIComponent(__yuyu_editor_text)
		.replace(/&#39;/g, '\'');
	let data = JSON.parse(decodeURIComponent(__yuyu_editor_data));
	let { type, uri } = data;

	$('#editor-main').val(text);

	$('#editor-submit').click(function () {
		text = $('#editor-main').val();

		// console.log('data: ', data);
		// console.log('text: ', text);
		$.post('/edit', {
			text: text,
			type: type,
			uri: uri,
		}, function() {
			window.location.href = uri;
		});
	})

})();