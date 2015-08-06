var fs = require("fs");
var zlib = require("zlib");
var browserPrefix = require("browser-prefix");
var minify = require("./minify.js");
var includeHtml = require("./includeHtml.js");

exports.load = function(endpoints, conf) {
	var res = {
		endpoints: {},
		templates: {},
		views: {}
	}

	//Prepare endpoints
	var errs = false;
	var eps = Object.keys(endpoints).map(function(i) {
		var ep = {
			path: endpoints[i],
			url: i
		}

		try {

			//The endpoint is a function if the file ends with .node.js
			if (/\.node\.js$/.test(ep.path)) {
				ep.func = require("../"+conf.dir.web+"/"+ep.path);
				return ep;

			//If it doesn't end with .node.js, it's a regular text file and will
			//just be served as is
			} else {
				ep.str = fs.readFileSync(conf.dir.web+"/"+ep.path, "utf8");

				//Add browser prefixes
				if (/\.css$/.test(ep.path)) {
					ep.str = browserPrefix(ep.str);
					ep.mimeType = "text/css";
					if (conf.minify) ep.str = minify.css(ep.str);
				} else if (/\.html$/.test(ep.path)) {
					ep.mimeType = "text/html";
					if (conf.minify) ep.str = minify.html(ep.str);
				} else if (/\.js$/.test(ep.path)) {
					ep.mimeType = "application/javascript";
					if (conf.minify) ep.str = minify.js(ep.str);
				}

				return ep;
			}

		//Errors will usually be because an endpoint doesn't exist
		} catch (err) {
			if (err.code == "ENOENT") {
				console.log(err.toString());
				errs = true;
			} else {
				throw err;
			}
		}
	});

	//No need to proceed if some endpoints don't exist
	if (errs) process.exit();

	eps.forEach(function(ep) {
		res.endpoints[ep.url] = ep;
	});


	//Prepare all templates
	var templates = {};
	fs.readdirSync("templates").forEach(function(f) {
		var name = f.replace(/\.html$/, "");
		res.templates[name] = includeHtml("templates/"+f, conf);
	});

	//Prepare all views
	var views = {};
	fs.readdirSync("views").forEach(function(f) {
		var name = f.replace(/\.html$/, "");
		res.views[name] = includeHtml("views/"+f, conf);
	});

	return res;
}
