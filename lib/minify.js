var minify = require("html-minifier").minify;

exports.html = function(src) {
	return src;
	return minify(src, {
		removeComments: true,
		collapseWhitespace: true,
	});
}
