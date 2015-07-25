var http = require("http");
var https = require("https");
var fs = require("fs");
var loader = require("./lib/loader.js");
var Context = require("./lib/context.js");
var Db = require("./lib/db.js");

var conf = JSON.parse(fs.readFileSync("conf.json"));

var endpoints = {

	//General files
	"/favicon.ico": "favicon.ico",
	"/global.css": "global.css",
	"/global.js": "global.js",
	"/404": "404.html",

	//Index files
	"/": "index/index.node.js",
	"/index/script.js": "index/script.js",
	"/index/style.css": "index/style.css",

	//Viewer files
	"/viewer": "viewer/index.node.js",
	"/viewer/script.js": "viewer/script.js",
	"/viewer/style.css": "viewer/style.css"
}

var loaded = loader.load(endpoints, conf);

//Function to run on each request
function onRequest(req, res) {
	console.log("Request for "+req.url);

	var ep = loaded.endpoints[req.url];

	//If the file doesn't exist, we 404.
	if (!ep) {
		ep = loaded.endpoints["/404"];
		res.writeHead(404);
	}

	//Execute if it's a .node.js, or just respond with the contents of the file
	if (typeof ep == "function") {
		ep(new Context({
			req: req,
			res: res,
			templates: loaded.templates,
			views: loaded.views,
			conf: conf
		}));
	} else {
		res.end(ep);
	}
}

//Initiate a postgresql client
var db = new Db(conf.db, function(err) {
	if (err) throw err;

	//Create HTTP or HTTPS server
	var server;
	if (conf.use_https) {
		server = https.createServer(conf.https, onRequest);
	} else {
		server = http.createServer(onRequest);
	}
	server.listen(conf.port);

	console.log("Listening on port "+conf.port+".");
});
