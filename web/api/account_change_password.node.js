var scrypt = require("scrypt");

module.exports = function(ctx) {
	ctx.getPostData(function(err, data) {
		if (err)
			return ctx.fail(err);

		if (!data.oldPassword || !data.newPassword)
			return ctx.fail("You must provide passwords.");

		if (!ctx.session.loggedIn)
			return ctx.fail("You're not logged in.");

		ctx.db.query(
			"SELECT id, pass_hash "+
			"FROM users "+
			"WHERE id = $1",
			[ctx.session.userId],
			queryCallback
		);
	});

	function queryCallback(err, res) {
		if (err)
			return ctx.fail(err);

		var user = res.rows[0];

		if (!user)
			return ctx.fail("User doesn't exist.");

		scrypt.verify(
			new Buffer(user.pass_hash, "hex"),
			new Buffer(ctx.postData.data.oldPassword),
			function(err, success) {
				if (!success)
					return ctx.fail("Wrong password.");

				updatePassword();
			}
		);
	}

	function updatePassword() {
		var params = scrypt.params(ctx.conf.scrypt.maxtime);
		scrypt.hash(
			new Buffer(ctx.postData.data.newPassword),
			params,
			function(err, hash) {
				if (err)
					return ctx.fail(err);

				ctx.db.query(
					"UPDATE users "+
					"SET pass_hash = $1 "+
					"WHERE id = $2",
					[hash.toString("hex"), ctx.session.userId],
					function(err, res) {
						if (err)
							return ctx.fail(err);

						ctx.succeed();
					}
				);
			}
		);
	}
}
