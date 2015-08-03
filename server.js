var http = require("http");
var https = require("https");
var fs = require("fs");
var domain = require("domain");
var zlib = require("zlib");
var loader = require("./lib/loader.js");
var pg = require("pg");
var Context = require("./lib/context.js");

var conf = JSON.parse(fs.readFileSync("conf.json"));

var endpoints = {

	//General
	"/favicon.ico": "favicon.node.js",
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
	"/view/script.js": "view/script.js",

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

//We cache static resources for a long time. However, we want to invalidate
//the browser's cache whenever a file updates. Therefore, we append
//a number to all static files, and the number increases every time we start
//the server. currentRun is that number.
var currentRun;
try {
	currentRun = parseInt(fs.readFileSync(".currentRun", "utf8"));
} catch (err) {
	if (err.code === "ENOENT")
		currentRun = 0;
	else
		throw err;
}
currentRun = (currentRun >= conf.max_runs ? 0 : currentRun);
currentRun = (currentRun || 0) + 1;
conf.current_run = currentRun.toString();
fs.writeFileSync(".currentRun", currentRun, "utf8");

var loaded = loader.load(endpoints, conf);

var db = new pg.Client(conf.db);

var gzipCache = {};

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
	if (ep === undefined) {
		ep = loaded.endpoints["/404"];
		ctx.setStatus(404);
	}

	//Execute if it's a .node.js, or just respond with the contents of the file
	if (typeof ep == "function") {
		ep(ctx);
	} else {

		//Cache content for a while
		ctx.setHeader("Cache-Control", "public, max-age="+conf.cache_max_age);

		//Gzip and such
		if (ctx.shouldGzip && gzipCache[req.url]) {
			ctx.end(gzipCache[req.url], true);
		} else if (ctx.shouldGzip) {
			zlib.gzip(ep, function(err, res) {
				gzipCache[req.url] = res;
				ctx.end(res, true);
			});
		} else {
			ctx.end(ep);
		}
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

	purgeCollections();
});

//On an interval, delete old collections from anonymous users
function purgeCollections() {
	var timeout = conf.purge_collections_timeout;
	db.query(
		"DELETE FROM collections "+
		"WHERE user_id IS NULL "+
		"AND date_created < NOW() - INTERVAL '"+timeout+"'",
		function(err, res) {
			if (err)
				throw err;

			if (res.rowCount > 0) {
				console.log(
					"Deleted "+res.rowCount+" collections "+
					"from over "+timeout+" ago."
				);
			}
		}
	);
}
setTimeout(purgeCollections, conf.purge_collections_interval);

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
