$(document).on("ready", function() {
	$("#password-form").on("submit", function(evt) {
		util.prevent(evt);

		var oldPass = $("#password-old").val();
		var newPass = $("#password-new").val();
		var repeatPass = $("#password-repeat").val();

		if (newPass !== repeatPass)
			return util.error("Passwords don't match.");

		util.api("account_change_password", {
			oldPassword: oldPass,
			newPassword: newPass
		}, function(err, res) {
			if (err)
				return util.error(err);

			util.notify("Password changed!");
		});
	});

	$("#logout-form").on("submit", function(evt) {
		evt.preventDefault();
		evt.stopPropagation();

		util.api("account_logout", {}, function(err, res) {
			if (err)
				return util.error(err);

			display.logIn();

			util.redirect("/");
		});
	});
});
