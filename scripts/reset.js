var fs = require("fs");
var pg = require("pg");	
var wrench = require("wrench");

var conf = JSON.parse(fs.readFileSync("./conf.json"));

var sql = fs.readFileSync("scripts/sql/reset.sql", "utf8");

var client = new pg.Client(conf.db);

try {
	fs.unlinkSync(".sessions");
	fs.unlinkSync(".currentRun");
} catch (err) {
	if (err.code !== "ENOENT")
		throw err;
}

function deleteFiles(dir) {
	fs.readdirSync(dir).forEach(function(f) {
		if (f[0] === ".")
			return;

		try {
			wrench.rmdirSyncRecursive(dir+"/"+f);
		} catch (err) {
			//:)
		}
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
