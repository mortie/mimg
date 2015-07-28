var fs = require("fs");
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
	Object.keys(endpoints).forEach(function(i) {
		var ep = endpoints[i];
		try {

			//The endpoint is a function if the file ends with .node.js
			if (/\.node\.js$/.test(ep)) {
				res.endpoints[i] = require("../"+conf.webroot+"/"+ep);

			//If it doesn't end with .node.js, it's a regular text file and will
			//just be served as is
			} else {
				res.endpoints[i] = fs.readFileSync(conf.webroot+"/"+ep, "utf8");

				//If it's an HTML file, we minify it
				if (!conf.minify) {
					//Don't minify unless the conf tells us to
				} else if (/\.html$/.test(ep)) {
					res.endpoints[i] = minify.html(res.endpoints[i]);
				} else if (/\.js$/.test(ep)) {
					res.endpoints[i] = minify.js(res.endpoints[i]);
				} else if (/\.css$/.test(ep)) {
					res.endpoints[i] = minify.css(res.endpoints[i]);
				}
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
