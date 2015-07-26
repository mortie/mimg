module.exports = function(ctx) {
	var id = parseInt(ctx.req.url.split("?")[1]);

	if (isNaN(id))
		return ctx.end(ctx.view("404"));

	ctx.db.query(
		"SELECT id, name, description, extension "+
		"FROM images "+
		"WHERE collection_id = $1",
		[id],
		queryCallback
	);

	function queryCallback(err, res) {
		if (err)
			return ctx.fail(err);

		var images = "";
		res.rows.forEach(function(row) {
			images += ctx.template("image", {
				title: row.name,
				id: row.id,
				extension: row.extension,
				description: row.description
			});
		});

		ctx.end(ctx.view("view", {
			profile: ctx.template("navbar-profile-login"),
			images: images
		}));
	}
}
