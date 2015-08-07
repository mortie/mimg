var fs = require("fs");

module.exports = function(ctx) {
	ctx.getPostData(function(err, data) {
		if (err)
			return ctx.fail(err);

		ctx.db.query(
			"INSERT INTO collections (name, user_id) "+
			"VALUES ($1, $2) "+
			"RETURNING id",
			[data.name, ctx.session.userId],
			queryCallback
		);
	});

	function queryCallback(err, res) {
		if (err)
			return ctx.fail(err);

		var id = res.rows[0].id;

		fs.mkdir(ctx.conf.dir.imgs+"/"+id, function(err) {
			if (err)
				return ctx.fail(err);

			ctx.session.lastCollectionId = id;

			ctx.succeed({
				id: id
			});
		});
	}
}
