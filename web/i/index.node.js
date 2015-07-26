var fs = require("fs");

module.exports = function(ctx) {
	var id = ctx.req.url.split("?")[1]
		.replace(/\..*/, "");

	var readStream = fs.createReadStream(ctx.conf.dir.imgs+"/"+id);
	readStream.pipe(ctx.res);
}
