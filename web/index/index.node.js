module.exports = function(ctx) {
	ctx.end(ctx.view("index", {
		profile: ctx.template("navbar-profile-login")
	}));
}
