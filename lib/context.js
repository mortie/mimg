var formidable = require("formidable");
var crypto = require("crypto");
var preprocess = require("./preprocess.js");

var sessions = {};

function templatify(str, args, ctx, env) {
	env.url = ctx.req.url;

	str = preprocess(str, {
		session: ctx.session,
		arg: function(key) {
			return ctx.htmlEntities(args[key]);
		},
		noescape: args,
		env: env,
		template: function(key) {
			return ctx.template(key);
		}
	});

	return str;
}

module.exports = function(options) {
	this.req = options.req;
	this.res = options.res;
	this.templates = options.templates;
	this.views = options.views;
	this.db = options.db;
	this.conf = options.conf;
	this.query = this.req.url.split("?")[1] || "";
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

		//Delete session after a while
		setTimeout(function() {
			delete sessions[key];
		}, this.conf.session_timeout);
	}
	this.session = sessions[key];

	//Reset session delete timer
	if (this.session._timeout)
		clearTimeout(this.session._timeout);

	this.session._timeout = setTimeout(function() {
		delete sessions[key];
	}, this.conf.session_timeout);
}

module.exports.prototype = {
	end: function(str) {
		if (this.conf.debug) {
			var ms = (new Date().getTime() - this.startTime.getTime());
			console.log(
				ms+" millisecond(s)\t"+
				(this.statusCode || 200)+"\t"+
				this.req.url
			);
		} else {
			conole.log(this.req.url);
		}

		if (this.statusCode)
			this.res.writeHead(this.statusCode);

		this.res.end(str);
	},

	succeed: function(obj) {
		obj = obj || {};
		obj.success = true;

		this.res.setHeader("Content-Type", "application/json");

		this.end(JSON.stringify(obj));
	},

	fail: function(err) {
		console.log("Sending error to client:");
		console.trace(err);

		this.res.setHeader("Content-Type", "application/json");

		obj = {};
		obj.success = false;
		obj.error = err.toString();
		this.end(JSON.stringify(obj));
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
