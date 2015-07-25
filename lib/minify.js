var minifyHtml = require("html-minifier").minify;
var minifyJs = require("uglify-js");
var minifyCss = require("uglifycss").processString;

exports.html = function(src) {
	return minifyHtml(src, {
		removeComments: true,
		collapseWhitespace: true,
	});
}

exports.js = function(src) {
	var ast = minifyJs.parse(src);
	ast.figure_out_scope();
	var compressor = minifyJs.Compressor();
	ast = ast.transform(compressor);
	return ast.print_to_string();
}

exports.css = function(src) {
	return minifyCss(src);
}
