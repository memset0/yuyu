(function(){
	let windowHeight, clientHeight, contentHeight;
	let pageNow, pageCounter;
	
	function moveToPage () {
		if (pageNow < 1) pageNow = 1;
		if (pageNow > pageCounter) pageNow = pageCounter;
		console.log('[readmode] page', pageNow, '/', pageCounter);
		$('#reader-container').css('margin-top', `-${(pageNow - 1) * perpageHeight}px`);
	}
	
	function render () {
		windowHeight = document.body.clientHeight;
		clientHeight = document.body.clientHeight - 60;
		
		$('body').css('height', '0');
		$('#container').prop('outerHTML', `
			<div id="container" class="ui main container" style="margin-top: 60px; height: ${clientHeight}px;">
				<div id="reader" style="height: ${clientHeight}px; overflow: hidden;">
					<div id="reader-container" style="padding-top: calc(6rem - 60px); padding-bottom: 4rem;">
						${$('#container').html()}
					</div>
				</div>
			</div>
			
			<button class="ui button" onclick="readmode.prevPage()" style="z-index: 102; position: fixed; bottom: 20px; left: 20px;">Prev</button>
			<button class="ui button" onclick="readmode.nextPage()" style="z-index: 102; position: fixed; bottom: 20px; right: 20px;">Next</button>
		`);
		
		contentHeight = $('#reader-container').prop('clientHeight');
		perpageHeight = clientHeight - 40;
		pageCounter = 1 + Math.ceil((contentHeight - clientHeight) / perpageHeight);
		pageNow = 1;
		
		moveToPage(pageNow);
	}
	
	function enable() {
		$(document).ready(function () {
			render();
		});
		window.readmode = {
			nextPage: function () { ++pageNow, moveToPage(); },
			prevPage: function () { --pageNow, moveToPage(); },
		};
	}
	
	// Cookies.set('yuyu.options.readmode', 'on');
	let enabled = Cookies.get('yuyu.options.readmode') ? true : false;
	if (enabled) {
		enable();
	}
})();