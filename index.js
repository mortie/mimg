var http = require("http");
var https = require("https");
var fs = require("fs");
var loader = require("./lib/loader.js");
var pg = require("pg");
var Context = require("./lib/context.js");

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
	"/view": "view/index.node.js",
	"/view/style.css": "view/style.css",

	//Plain image files
	"/i": "i/index.node.js",

	//API files
	"/api/image_create": "api/image_create.node.js",
	"/api/collection_create": "api/collection_create.node.js"
}

var loaded = loader.load(endpoints, conf);

var db = new pg.Client(conf.db);

//Function to run on each request
function onRequest(req, res) {
	console.log("Request for "+req.url);

	var ep = loaded.endpoints[req.url.split("?")[0]];

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
			db: db,
			conf: conf
		}));
	} else {
		res.end(ep);
	}
}

//Initiate a postgresql client
db.connect(function() {
	
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
