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
	});

	util.error = function(body) {
		util.notify("Error: "+body);
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
			if (res.success)
				cb(null, res);
			else
				cb(res.error);
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

	window.display = {};

	window.display.loggedIn = function() {
		util.api("template?navbar-loggedin", {}, function(err, res) {
			if (err)
				return util.error(err);

			$("#navbar-profile-container").html(res.html);
		});
	}

	$(document).ready(function() {
		$("#login-form").on("submit", function(evt) {
			evt.stopPropagation();
			evt.preventDefault();

			var username = $("#login-username").val();
			var password = $("#login-password").val();

			util.api("account_login", {
				username: username,
				password: password
			}, function(err, res) {
				if (err)
					util.error(err);
				else
					display.loggedIn();
			});
		});
	});
})();
