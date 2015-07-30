module.exports = function(ctx) {
	if (!ctx.session.loggedIn)
		return ctx.end(ctx.view("404"));

	ctx.end(ctx.view("settings"));
}
