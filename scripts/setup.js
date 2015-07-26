var fs = require("fs");
var pg = require("pg");	

var conf = JSON.parse(fs.readFileSync("./conf.json"));

var sql = fs.readFileSync("sql/setup.sql", "utf8");

var client = new pg.Client(
	"postgres://"+
	conf.db.user+":"+
	conf.db.pass+"@"+
	conf.db.host+"/"+
	conf.db.database
);

client.connect(function(err) {
	if (err) {
		console.log("Couldn't connect: "+err);
		console.log("Make sure that the database exists.");
		process.exit();
	}

	client.query(sql, function(err, res) {
		if (err) {
			console.log("Error running query: "+err);
			console.log("Make sure that the database is empty.");
		} else {
			console.log("Database set up.");
		}
		process.exit();
	});
});
