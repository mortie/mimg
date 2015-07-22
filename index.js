var http = require("http");
var fs = require("fs");
var Api = require("./api.js");

var conf = JSON.parse(fs.readFileSync("conf.json"));

var files = {
	"/": "index.html",
	"/404": "404.html",
	"/viewer": "viewer.node.js"
}

//Prepare files
var errs = false;
Object.keys(files).forEach(function(i) {
	try {
		if (/\.node\.js$/.test(files[i]))
			files[i] = require("./"+conf.webroot+"/"+files[i]);
		else
			files[i] = fs.readFileSync(conf.webroot+"/"+files[i], "utf8");
	} catch (err) {
		console.log(err.toString());
		errs = true;
	}
});
if (errs)
	process.exit();

//Prepare all templates
var templates = {};
fs.readdirSync("templates").forEach(function(f) {
	templates[f.replace(/\.html$/, "")] = fs.readFileSync("templates/"+f, "utf8");
});

function onRequest(req, res) {
	console.log("Request for "+req.url);

	var file = files[req.url];

	if (!file) {
		file = files["/404"];
		res.writeHead(404);
	}

	if (typeof file == "function")
		file(new Api(req, res, templates, conf));
	else
		res.end(file);
}

var server = http.createServer(onRequest);
server.listen(conf.port);

console.log("Listening on port "+conf.port+".");
