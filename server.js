var http = require("http");
var https = require("https");
var fs = require("fs");
var domain = require("domain");
var loader = require("./lib/loader.js");
var pg = require("pg");
var Context = require("./lib/context.js");

var conf = JSON.parse(fs.readFileSync("conf.json"));

var endpoints = {

	//General
	"/favicon.ico": "favicon.ico",
	"/global.css": "global.css",
	"/global.js": "global.js",
	"/404": "404.node.js",

	//Index
	"/": "index/index.node.js",
	"/index/script.js": "index/script.js",
	"/index/style.css": "index/style.css",

	//Register
	"/register": "register/index.node.js",
	"/register/style.css": "register/style.css",
	"/register/script.js": "register/script.js",

	//Profile
	"/profile": "profile/index.node.js",
	"/profile/style.css": "profile/style.css",
	"/profile/script.js": "profile/script.js",

	//Settings
	"/settings": "settings/index.node.js",
	"/settings/style.css": "settings/style.css",
	"/settings/script.js": "settings/script.js",

	//Viewer
	"/view": "view/index.node.js",
	"/view/style.css": "view/style.css",

	//Plain images
	"/i": "i/index.node.js",

	//API
	"/api/template": "api/template.node.js",
	"/api/image_create": "api/image_create.node.js",
	"/api/collection_create": "api/collection_create.node.js",
	"/api/account_create": "api/account_create.node.js",
	"/api/account_login": "api/account_login.node.js",
	"/api/account_logout": "api/account_logout.node.js",
	"/api/account_change_password": "api/account_change_password.node.js"
}

var loaded = loader.load(endpoints, conf);

var db = new pg.Client(conf.db);

//Function to run on each request
function onRequest(req, res) {
	var ctx = new Context({
		req: req,
		res: res,
		templates: loaded.templates,
		views: loaded.views,
		db: db,
		conf: conf
	});

	var ep = loaded.endpoints[req.url.split("?")[0]];

	//If the file doesn't exist, we 404.
	if (!ep) {
		ep = loaded.endpoints["/404"];
		ctx.setStatus(404);
	}

	//Execute if it's a .node.js, or just respond with the contents of the file
	if (typeof ep == "function") {
		ep(ctx);
	} else {
		ctx.end(ep);
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

//We don't want to crash even if something throws an uncaught exception.
if (!conf.debug) {
	var d = domain.create();
	d.on("error", function(err) {
		console.trace(err);
	});
	process.on("uncaughtException", function(err) {
		console.trace(err);
	});
}

function command(tokens) {
	switch(tokens[0]) {

	//Reload configuration
	case "reload-conf":
		var c = JSON.parse(fs.readFileSync("conf.json"));
		for (var i in c)
			conf[i] = c[i];
		break;

	//Reload HTML
	case "reload-html":
		var l = loader.load(endpoints, conf);
		for (var i in l)
			loaded[i] = l[i];
		break;

	//Reload everything
	case "reload":
		command(["reload-conf"]);
		command(["reload-html"]);
		break;

	default: return false;
	}
	return true;
}

process.stdin.on("data", function(line) {
	var tokens = line.toString().split(/\s+/);
	if (command(tokens)) {
		return console.log(tokens[0]+" completed successfully.");
	} else {
		return console.log("Command not found: "+tokens[0]);
	}
});
