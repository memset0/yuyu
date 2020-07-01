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
	function search() {
		if ($('#search-input').val()) {
			window.location.href = '/search/' + $('#search-input').val();
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