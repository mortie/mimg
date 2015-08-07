var wrench = require("wrench");

module.exports = function(ctx) {
	ctx.getPostData(function(err, data) {
		var id = parseInt(data.id);

		if (isNaN(id))
			return ctx.fail("Invalid ID.");

		if (id === ctx.session.lastCollectionId)
			return deleteQuery();

		if (!ctx.session.loggedIn)
			return ctx.fail("You're not logged in.");

		ctx.db.query(
			"SELECT FROM collections "+
			"WHERE user_id = $1",
			[ctx.session.userId],
			function(err, res) {
				if (err)
					return ctx.fail(err);

				if (res.rows[0] === undefined)
					return ctx.fail("You don't own that collection.");

				deleteQuery();
			}
		);
	});

	function deleteQuery() {
		ctx.db.query(
			"DELETE FROM collections "+
			"WHERE id = $1",
			[ctx.postData.data.id],
			queryCallback
		);
	}

	function queryCallback(err, res) {
		if (err)
			return ctx.fail(err);

		try {
			wrench.rmdirSyncRecursive(
				ctx.conf.dir.imgs+"/"+
				ctx.postData.data.id
			);
		} catch (err) {
			return ctx.fail(err);
		}

		ctx.succeed();
	}
}
