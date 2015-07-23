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
	}
}
