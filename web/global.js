(function() {
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
	$(document).ready(function() {
		$("#notify-box").on("mouseenter", function() {
			clearTimeout(util.notify.timeout);
		});

		$("#login-form").on("submit", function(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			util.notify("Feature Not Implemented", "This feature is not implemented.");
		});
	});

	util.htmlEntities = function(str) {
		return str.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&lt;")
			.replace(/"/g, "&quot");
	}

	util.api = function(name, data, cb, getXhr) {
		var fd = new FormData();

		for (var i in data) {
			console.log(i);
			fd.append(i, data[i]);
		}

		return $.ajax({
			method: "POST",
			url: "/api/"+name,
			data: fd,
			processData: false,
			contentType: false,
			xhr: function() {
				var xhr = new XMLHttpRequest();

				if (getXhr)
					getXhr(xhr);

				return xhr;
			}
		}).done(function(res) {
			var obj = JSON.parse(res);
			if (obj.success)
				cb(null, obj);
			else
				cb(obj.error);
		});
	}
})();
