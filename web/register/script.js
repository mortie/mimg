$(document).on("ready", function() {
	$("#register-form").on("submit", function(evt) {
		console.log(evt);
		evt.preventDefault();
		evt.stopPropagation();

		var username = $("#register-username").val();
		var password = $("#register-password").val();
		var password2 = $("#register-password-repeat").val();

		if (password !== password2)
			return util.error("Paswords don't match.");

		if (!username)
			return util.error("You must supply a username.");

		if (!password)
			return util.error("You must supply a password.");

		util.api("account_create", {
			username: username,
			password: password
		}, function(err, res) {
			if (err)
				return util.error(err);

			display.loggedIn();

			setTimeout(function() {
				location.href = "/profile?"+res.id;
			}, 1000);
		});
	});
});
