module.exports = function(ctx) {
	ctx.getPostData(function(err, data) {
		if (err)
			return ctx.fail(err);

		ctx.db.query(
			"INSERT INTO collections (name) "+
			"VALUES ($1) "+
			"RETURNING id",
			[data.name],
			queryCallback
		);
	});

	function queryCallback(err, res) {
		if (err)
			return ctx.fail(err);

		ctx.session.collectionId = res.rows[0].id;

		ctx.succeed({
			id: res.rows[0].id
		});
	}
}
