var scrypt = require("scrypt");

module.exports = function(ctx) {
	ctx.getPostData(function(err, data) {
		if (err)
			return ctx.fail(err);

		if (!data.username || !data.password)
			return ctx.fail("You must provide a username and a password.");

		var params = scrypt.params(1);
		scrypt.hash(new Buffer(data.password), params, function(err, hash) {
			if (err)
				return ctx.fail(err);

			ctx.db.query(
				"INSERT INTO users (username, pass_hash) "+
				"VALUES ($1, $2 )"+
				"RETURNING id",
				[data.username, hash.toString("hex")],
				queryCallback
			);
		});
	});

	function queryCallback(err, res) {
		if (err)
			return ctx.fail(err);

		ctx.login(ctx.postData.data.username, res.rows[0].id);

		ctx.succeed({
			id: res.rows[0].id
		});
	}
}
