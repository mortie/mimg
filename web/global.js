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

	util.error = function(body) {
		util.notify("An error occurred.", body);
	}

	util.htmlEntities = function(str) {
		return str.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&lt;")
			.replace(/"/g, "&quot");
	}

	util.api = function(name, data, cb, getXhr) {
		var fd = new FormData();

		for (var i in data) {
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
			console.log("response from "+name+":");
			console.log(res);
			var obj = JSON.parse(res);
			if (obj.success)
				cb(null, obj);
			else
				cb(obj.error);
		});
	}

	util.async = function(n, cb) {
		if (typeof n !== "number")
			throw new Error("Expected number, got "+typeof n);

		if (n < 1)
			return cb();

		var res = {};

		return function(key, val) {
			if (key !== undefined)
				res[key] = val;

			if (n === 1)
				cb(res);
			else
				n -= 1;
		}
	}
})();
