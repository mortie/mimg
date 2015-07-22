module.exports = function(req, res, templates, conf) {
	this.req = req;
	this.res = res;
	this.templates = templates;
	this.conf = conf;
}

module.exports.prototype = {
	end: function(str) {
		this.res.end(str);
	},

	template: function(name, args) {
		var str = this.templates[name];

		if (!str)
			throw new Error("No such template: "+name);

		for (var i in args) {
			str = str.split("{{"+i+"}}").join(args[i]);
		}

		return str;
	}
}
