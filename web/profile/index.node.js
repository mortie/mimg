module.exports = function(ctx) {
	var id = ctx.query;

	ctx.db.query(
		"SELECT name, date_created, id "+
		"FROM collections "+
		"WHERE user_id = $1",
		[id],
		function(err, res) { a("collections", res, err) }
	);

	ctx.db.query(
		"SELECT username "+
		"FROM users "+
		"WHERE id = $1",
		[id],
		function(err, res) { a("users", res, err) }
	);

	var a = ctx.async(2, function(err, res) {
		if (err)
			return ctx.fail(err);

		if (!res.collections || !res.users)
			return ctx.end(ctx.view("404"));

		var user = res.users.rows[0];
		if (!user)
			return ctx.end(ctx.view("404"));

		var collections = "";
		res.collections.rows.forEach(function(row) {
			var d = new Date(row.date_created);

			collections += ctx.template("collection", {
				name: row.name,
				date_created: d.toString(),
				id: row.id
			});
		});

		ctx.end(ctx.view("profile", {
			username: user.username,
			collections: collections
		}));
	});
}
