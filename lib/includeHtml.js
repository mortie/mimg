var fs = require("fs");
var minify = require("./minify.js");
var preprocess = require("./preprocess.js");

var cache = {};

module.exports = function load(path, conf) {
	var html = fs.readFileSync(path, "utf8");

	var env = {
		conf: conf,
		template: function(key) {
			var str = load("templates/"+key+".html", conf);
			return str;
		}
	}

	html = preprocess(html, env);

	if (conf.minify)
		return minify.html(html);
	else
		return html;
}
