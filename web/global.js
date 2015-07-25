$(document).ready(function() {
	window.util = {};

	util.notify = function notify(title, body) {
		var elem = $("#notify-box");

		elem.children(".title").html(title);
		elem.children(".body").html(body || "");
		elem.addClass("active");

		notify.timeout = setTimeout(function() {
			elem.removeClass("active");
		}, 5000);
	}
	$("#notify-box").on("mouseenter", function() {
		clearTimeout(util.notify.timeout);
	});

	$("#login-form").on("submit", function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		util.notify("Feature Not Implemented", "This feature is not implemented.");
	});
});
