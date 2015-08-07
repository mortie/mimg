var fs = require("fs");

module.exports = function(ctx) {
	ctx.getPostData(function(err, data, files) {
		if (err)
			return ctx.fail(err);

		if (!files.file)
			return ctx.fail("No file supplied.");

		data.collectionId = parseInt(data.collectionId);

		if (data.lastCollectionId !== ctx.session.collectionId)
			return ctx.fail("You don't own that collection.");

		//We want all extensions to be lower case.
		data.extension = data.extension.toLowerCase();

		ctx.db.query(
			"INSERT INTO images (name, description, extension, collection_id) "+
			"VALUES ($1, $2, $3, $4) "+
			"RETURNING id, collection_id",
			[data.name, data.description, data.extension, data.collectionId],
			queryCallback
		);
	});

	function queryCallback(err, res) {
		if (err)
			return ctx.fail(err);

		var id = res.rows[0].id;
		var collectionId = res.rows[0].collection_id;
		var file = ctx.postData.files.file;

		var readStream = fs.createReadStream(file.path);
		var writeStream = fs.createWriteStream(
			ctx.conf.dir.imgs+"/"+
			collectionId+"/"+
			id
		);

		readStream.pipe(writeStream);

		readStream.on("end", function() {
			ctx.succeed({
				id: id
			});
		});
	}
}
