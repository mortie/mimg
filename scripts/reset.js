var fs = require("fs");
var pg = require("pg");	

var conf = JSON.parse(fs.readFileSync("./conf.json"));

var sql = fs.readFileSync("sql/reset.sql", "utf8");

var client = new pg.Client(
	"postgres://"+
	conf.db.user+":"+
	conf.db.pass+"@"+
	conf.db.host+"/"+
	conf.db.database
);

client.connect(function(err) {
	if (err) {
		return console.log("Couldn't connect: "+err);
		process.exit();
	}

	client.query(sql, function(err, res) {
		if (err) {
			console.log("Error running query: "+err);
		} else {
			console.log("Database reset.");
		}
		process.exit();
	});
});
