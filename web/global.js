(function() {
	var months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];

	window.util = {};

	util.notify = function notify(title, body) {
		var elem = $("#notify-box");

		elem.children(".title").html(title);
		elem.children(".body").html(body || "");
		elem.addClass("active");

		notify.timeout = setTimeout(function() {
			elem.removeClass("active");
		}, 5000);
	};
	$(document).ready(function() {
		$("#notify-box").on("mouseenter", function() {
			clearTimeout(util.notify.timeout);
		});
	});

	util.error = function(body) {
		util.notify("Error: "+body);
	};

	util.htmlEntities = function(str) {
		return str.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	};

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
			},
			error: function(xhr, status, err) {
				cb(err);
			}
		}).done(function(res) {
			console.log("response from "+name+":");
			console.log(res);
			if (res.success)
				cb(null, res);
			else
				cb(res.error);
		});
	};

	util.async = function(n, cb) {
		if (typeof n !== "number")
			throw new Error("Expected number, got "+typeof n);

		if (n < 1)
			return cb();

		var res = {};

		return function(key, val, err) {
			if (key)
				res[key] = val;

			if (n === 1)
				cb(res);
			else
				n -= 1;
		};
	};

	util.pad = function(str, length, padChar) {
		var missing = (length - str.length) + 1;

		if (missing <= 0)
			return str;

		return new Array(missing).join(padChar) + str;
	};

	util.dateToString = function(date) {
		var day = util.pad(date.getDate().toString(), 2, "0");
		var month = months[date.getMonth()];

		return day+". of "+month+" "+
			date.getFullYear()+", "+
			util.pad(date.getHours().toString(), 2, "0")+":"+
			util.pad(date.getMinutes().toString(), 2, "0");
	};

	util.prevent = function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
	};

	util.redirect = function(url, timeout) {
		setTimeout(function() {
			location.href = url;
		}, timeout || 1000);
	};

	window.display = {};

	display.loggedIn = function() {
		util.api("template?navbar-loggedin", {}, function(err, res) {
			if (err)
				return util.error(err);

			$("#navbar-profile-container").html(res.html);

			util.notify("Logged In", "You are now logged in.");
		});
	};

	display.logIn = function() {
		util.api("template?navbar-login", {}, function(err, res) {
			if (err)
				return util.error(err);

			$("#navbar-profile-container").html(res.html);

			util.notify("Logged Out", "You are now logged out.");
		});
	};

	$(document).ready(function() {
		$("#login-form").on("submit", function(evt) {
			util.prevent(evt);

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
