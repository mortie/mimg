var fs = require("fs");

module.exports = function(ctx) {
	var readStream = fs.createReadStream("favicon.ico");
	readStream.pipe(ctx.res);

	readStream.on("error", function(err) {
		if (err.code === "ENOENT")
			ctx.end(ctx.view("404"));
		else
			ctx.end(err.toString());
	});
}
