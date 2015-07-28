var fs = require("fs");
var pg = require("pg");	

var conf = JSON.parse(fs.readFileSync("./conf.json"));

var sql = fs.readFileSync("scripts/sql/reset.sql", "utf8");

var client = new pg.Client(conf.db);

function deleteFiles(dir) {
	fs.readdirSync(dir).forEach(function(f) {
		fs.unlinkSync(dir+"/"+f);
	});
}

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

		deleteFiles(conf.dir.imgs);
		process.exit();
	});
});
