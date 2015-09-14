var fs = require("fs");

module.exports = function(ctx) {
	var parts = ctx.query.split(".");
	var collection = parseInt(parts[0]);
	var id = parseInt(parts[1]);

	if (!id || !collection)
		return ctx.err404();

	ctx.res.setHeader(
		"Cache-Control",
		"public, max-age="+ctx.conf.cache_max_age_images
	);

	var readStream = fs.createReadStream(
		ctx.conf.dir.imgs+"/"+
		collection+"/"+
		id
	);
	readStream.pipe(ctx.res);

	readStream.on("error", function(err){
		if (err.code === "ENOENT")
			ctx.err404();
		else
			ctx.end(err.toString());
	});
}
