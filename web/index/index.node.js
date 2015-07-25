module.exports = function(ctx) {
	ctx.end(ctx.view("index", {
		head: ctx.template("head"),
		global: ctx.template("global", {
			profile: ctx.template("navbar-profile-login")
		})
	}));
}
