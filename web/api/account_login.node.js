var scrypt = require("scrypt");

module.exports = function(ctx) {
	ctx.getPostData(function(err, data) {
		if (err)
			return ctx.fail(err);

		if (!data.username || !data.password)
			return ctx.fail("You must provide a username and a password.");

		ctx.db.query(
			"SELECT id, username, pass_hash "+
			"FROM users "+
			"WHERE username=$1",
			[data.username],
			queryCallback
		);
	});

	function queryCallback(err, res) {
		if (err)
			return ctx.fail(err);

		var user = res.rows[0];

		if (!user)
			return ctx.fail("Wrong username or password.");

		ctx.login(user.username, user.id);

		scrypt.verifyKdf(
			new Buffer(user.pass_hash, "hex"),
			new Buffer(ctx.postData.data.password),
			function(err, success) {
				if (success) {
					ctx.succeed({
						id: user.id
					})
				} else {
					ctx.fail("Wrong username or password.");
				}
			}
		);
	}
}
