var http = require("http");
var https = require("https");
var fs = require("fs");
var Context = require("./lib/context.js");

var conf = JSON.parse(fs.readFileSync("conf.json"));

var endpoints = {
	"/": "index.html",
	"/404": "404.html",
	"/viewer": "viewer.node.js"
}

//Prepare files
var errs = false;
Object.keys(endpoints).forEach(function(i) {
	try {

		//The endpoint is a function if the file ends with .node.js
		if (/\.node\.js$/.test(endpoints[i])) {
			endpoints[i] = require("./"+conf.webroot+"/"+endpoints[i]);

		//If it doesn't end with .node.js, it's a regular text file and will
		//just be served as is
		} else {
			endpoints[i] = fs.readFileSync(conf.webroot+"/"+endpoints[i], "utf8");
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
	templates[f.replace(/\.html$/, "")] = fs.readFileSync("templates/"+f, "utf8");
});

function onRequest(req, res) {
	console.log("Request for "+req.url);

	var ep = endpoints[req.url];

	//If the file doesn't exist, we 404.
	if (!ep) {
		ep = endpoints["/404"];
		res.writeHead(404);
	}

	//Execute if it's a .node.js, or just respond with the contents of the file
	if (typeof ep == "function") {
		ep(new Context(req, res, templates, conf));
	} else {
		res.end(ep);
	}
}

var server;
if (conf.use_https) {
	server = https.createServer(conf.https, onRequest);
} else {
	server = http.createServer(onRequest);
}
server.listen(conf.port);

console.log("Listening on port "+conf.port+".");
