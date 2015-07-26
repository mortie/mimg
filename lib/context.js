var formidable = require("formidable");

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
	this.conf = options.conf;
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
		obj = obj || {};
		obj.success = false;
		obj.error = error;
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
		if (this.req.method.toUpperCase() != "POST")
			return cb(new Error("Expected POST request, got "+this.req.method));

		var form = new formidable.IncomingForm();
		form.parse(this.req, cb);
	}
}
