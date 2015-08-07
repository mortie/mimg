module.exports = function(ctx) {
	if (!ctx.session.loggedIn)
		return ctx.err404();

	ctx.end(ctx.view("settings"));
}
