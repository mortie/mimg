var scrypt = require("scrypt");

module.exports = function(ctx) {
	ctx.logout();
	ctx.succeed();
}
