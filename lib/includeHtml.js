var fs = require("fs");
var minify = require("./minify");

module.exports = function(path, conf) {
	var html = fs.readFileSync(path, "utf8");

	for (var i in conf) {
		html = html.split("{{conf#"+i+"}}").join(conf[i]);
	}

	html = minify.html(html);

	return html;
}
