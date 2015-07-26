var fs = require("fs");
var minify = require("./minify");

var globalRegex = /{{([^}]+)#([^}]+)}}/g;
var localRegex = /{{([^}]+)#([^}]+)}}/;

module.exports = function load(path, conf) {
	var html = fs.readFileSync(path, "utf8");

	var placeholders = html.match(globalRegex);
	if (!placeholders)
		return minify.html(html);

	placeholders.forEach(function(p) {
		var parts = html.match(localRegex);

		var s = parts[0];
		var ns = parts[1];
		var key = parts[2];

		switch (ns) {
		case "conf":
			html = html.replace(s, conf[key]);
			break;
		case "template":
			html = html.replace(s, load("templates/"+key+".html", conf));
			break;
		}
	});

	return minify.html(html);
}
