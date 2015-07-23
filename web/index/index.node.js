module.exports = function(ctx) {
	ctx.end(ctx.view("index", {
		header: ctx.template("header")
	}));
}
