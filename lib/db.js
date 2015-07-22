var pg = require("pg");

module.expors = function(conf, cb) {
	var conStr =
		"postgres://"+
		conf.user+":"+
		conf.pass+"@"+
		conf.host+"/"+
		conf.database;

	pg.connect(conStr, function(err, client) {
		if (err) return cb(err);

		this.client = client;
		cb();
	}.bind(this));
}

module.exports.prototype = {
	query: function
}
