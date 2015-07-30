var fs = require("fs");

module.exports = function(ctx) {
	var id = ctx.query.replace(/\..*/, "");
	if (!id)
		return ctx.end(ctx.view("404"));

	var readStream = fs.createReadStream(ctx.conf.dir.imgs+"/"+id);
	readStream.pipe(ctx.res);

	readStream.on("error", function(err){
		if (err.code == "ENOENT")
			ctx.end(ctx.view("404"));
		else
			ctx.end(err.toString());
	});
}
