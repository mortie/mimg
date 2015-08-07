var fs = require("fs");
var zlib = require("zlib");
var log = require("mlogger");

var gzipped;

var favicon;
try {
	favicon = fs.readFileSync("favicon.ico");
} catch (err) {
	if (err.code === "ENOENT")
		log.notice("No favicon.ico found.");
	else
		throw err;
}

if (favicon !== undefined) {
	zlib.gzip(favicon, function(err, res) {
		gzipped = res;
	});
}

module.exports = function(ctx) {

	if (favicon) {
		ctx.res.setHeader(
			"Cache-Control",
			"public, max-age="+ctx.conf.cache_max_age
		);
	}

	if (gzipped && ctx.shouldGzip) {
		ctx.res.setHeader("Content-Encoding", "gzip");
		ctx.res.end(gzipped);
	} else if (favicon) {
		ctx.res.end(favicon);
	} else {
		ctx.err404();
	}
}
