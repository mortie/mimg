var formidable = require("formidable");
var crypto = require("crypto");
var zlib = require("zlib");
var fs = require("fs");
var log = require("mlogger");
var preprocess = require("./preprocess.js");

var sessions = {};
var sessionTimeouts = {};

if (fs.existsSync(".sessions")) {
	sessions = JSON.parse(fs.readFileSync(".sessions", "utf8"));

	//Set appropriate timeouts.
	Object.keys(sessions).forEach(function(i) {
		sessionTimeouts[i] = setTimeout(function() {
			delete sessions[i];
		}, 1000*60*10);
	});
}

function saveSessions() {
	fs.writeFileSync(".sessions", JSON.stringify(sessions));
	process.exit();
}

process.on("SIGINT", saveSessions);
process.on("SIGTERM", saveSessions);

function templatify(str, args, ctx, env) {
	env.url = ctx.req.url;

	var env = {
		session: function(key) {
			ctx.cachable = false;
			return ctx.session[key];
		},
		arg: function(key) {
			return ctx.htmlEntities(args[key]);
		},
		noescape: args,
		env: env,
		template: function(key) {
			return ctx.template(key, args);
		}
	}

	str = preprocess(str, env);

	return str;
}

var cache = {};

module.exports = function(options) {
	this.req = options.req;
	this.res = options.res;
	this.templates = options.templates;
	this.views = options.views;
	this.db = options.db;
	this.conf = options.conf;
	this.query = this.req.url.split("?")[1] || "";
	this.shouldGzip = /gzip/.test(this.req.headers["accept-encoding"]);

	this.cachable = true;
	this.statusCode = 200;
	this.headers = {};
	if (this.conf.debug)
		this.startTime = new Date();

	//Handle cookies
	this.cookies = {};
	this.req.headers.cookie = this.req.headers.cookie || "";
	this.req.headers.cookie.split(/;\s*/).forEach(function(elem) {
		var pair = elem.split("=");
		this.cookies[pair[0]] = decodeURIComponent(pair[1]);
	}.bind(this));

	//Handle sessions
	var key;
	if (sessions[this.cookies.session]) {
		key = this.cookies.session;
	} else {
		do {
			key = crypto.randomBytes(64).toString("hex");
		} while (sessions[key]);

		sessions[key] = {};
		this.res.setHeader("Set-Cookie", "session="+key);
	}
	this.session = sessions[key];

	//Reset session delete timer
	if (sessionTimeouts[key])
		clearTimeout(sessionTimeouts[key]);

	sessionTimeouts[key] = setTimeout(function() {
		delete sessions[key];
	}, this.conf.session_timeout);
}

module.exports.prototype = {
	_end: function(str) {
		if (this.conf.debug) {
			var ms = (new Date().getTime() - this.startTime.getTime());
			log.info(
				"Request:\t"+
				ms+" millisecond(s)\t"+
				(this.statusCode || 200)+"\t"+
				this.req.url
			);
		} else {
			log.info("Request: "+this.req.url);
		}

		this.res.writeHead(this.statusCode, this.headers);
		this.res.end(str);
	},

	end: function(str, alreadyGzipped) {
		if (!this.shouldGzip)
			return this._end(str);

		this.setHeader("Content-Encoding", "gzip");

		if (alreadyGzipped)
			return this._end(str);

		zlib.gzip(str, function(err, res) {
			if (err)
				throw err;

			this._end(res);
		}.bind(this));
	},

	succeed: function(obj) {
		obj = obj || {};
		obj.success = true;

		this.setHeader("Content-Type", "application/json");

		this.end(JSON.stringify(obj));
	},

	fail: function(err) {
		log.info("Sending error to client:");
		log.info(err);

		this.setHeader("Content-Type", "application/json");

		obj = {};
		obj.success = false;
		obj.error = err.toString();
		this.end(JSON.stringify(obj));
	},

	err404: function() {
		this.setStatus(404);
		this.end(this.view("404"));
	},

	template: function(name, args) {
		var str = this.templates[name];
		if (!str)
			throw new Error("No such template: "+name);

		return templatify(str, args, this, {template: name});
	},

	view: function(name, args) {
		var str = this.views[name];
		if (!str)
			throw new Error("No such view: "+name);

		return templatify(str, args, this, {view: name});
	},

	getPostData: function(cb) {
		if (this.postData)
			return cb(null, this.postData.data, this.postData.files);

		if (this.req.method.toUpperCase() != "POST")
			return cb(new Error("Expected POST request, got "+this.req.method));

		var form = new formidable.IncomingForm();
		form.parse(this.req, function(err, data, files) {
			if (err) return cb(err);

			this.postData = {
				data: data,
				files: files
			}

			cb(null, data, files);
		}.bind(this));
	},

	setStatus: function(code) {
		this.statusCode = code;
	},

	setHeader: function(key, val) {
		this.headers[key] = val;
	},

	login: function(username, id) {
		this.session.loggedIn = true;
		this.session.username = username;
		this.session.userId = id;
	},

	logout: function() {
		this.session.loggedIn = false;
		delete this.session.username;
		delete this.session.userId;
	},

	async: function(n, cb) {
		if (typeof n !== "number")
			throw new Error("Expected number, got "+typeof n);

		if (n < 1)
			return cb();

		var res = {};
		var errs = {};
		var errnum = 0;

		return function(key, val, err) {
			if (key)
				res[key] = val;
			if (err)
				errs[key] = err;

			if (n === 1)
				cb((errnum ? errs : null), res);
			else
				n -= 1;
		}
	},

	htmlEntities: function(arg) {
		if (typeof arg === "string") {
			return arg.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;");
		} else {
			return arg;
		}
	}
}
