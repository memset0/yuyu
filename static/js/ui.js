$(document).ready(function () {
	$('.ui.menu .ui.dropdown').dropdown({
		on: 'hover'
	});
	$('.ui.menu a.item').on('click', function () {
		$(this)
			.addClass('active')
			.siblings().removeClass('active');
	});
});


// search
(function () {
	if (location.pathname.startsWith('/search/')) {
		let keyword = decodeURIComponent(location.pathname.replace(/^\/search\//, ''));
		// console.log(keyword);
		$('#search-input').val(keyword);
	}

	function search() {
		if ($('#search-input').val()) {
			let keyword = encodeURIComponent($('#search-input').val());
			window.location.href = '/search/' + keyword;
		}
	}

	$('#search-button').bind('click', function () {
		search();
	});

	$('#search-input').bind('keypress', function (e) {
		e = e || window.event;
		if (e.keyCode == 13) { search(); }
	});
})();