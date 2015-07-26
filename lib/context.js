var formidable = require("formidable");
var crypto = require("crypto");

var sessions = {};

function templatify(str, args) {
	if (args == undefined)
		return str;

	for (var i in args) {
		str = str.split("{{"+i+"}}").join(args[i]);
	}

	return str;
}

module.exports = function(options) {
	this.req = options.req;
	this.res = options.res;
	this.templates = options.templates;
	this.views = options.views;
	this.db = options.db;
	this.conf = options.conf;

	//Handle cookies
	this.cookies = {};
	this.req.headers.cookie = this.req.headers.cookie || "";
	this.req.headers.cookie.split(/;\s*/).forEach(function(elem) {
		var pair = elem.split("=");
		this.cookies[pair[0]] = decodeURIComponent(pair[1]);
	}.bind(this));

	//Handle sessions
	if (sessions[this.cookies.session]) {
		this.session = sessions[this.cookies.session];
	} else {
		var key;
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
}

module.exports.prototype = {
	end: function(str) {
		this.res.end(str);
	},

	succeed: function(obj) {
		obj = obj || {};
		obj.success = true;

		this.end(JSON.stringify(obj));
	},

	fail: function(err) {
		obj = {};
		obj.success = false;
		obj.error = err.toString();
		this.end(JSON.stringify(obj));
	},

	template: function(name, args) {
		var str = this.templates[name];
		if (!str)
			throw new Error("No such template: "+name);

		return templatify(str, args);
	},

	view: function(name, args) {
		var str = this.views[name];
		if (!str)
			throw new Error("No such view: "+name);

		return templatify(str, args);
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
	}
}
