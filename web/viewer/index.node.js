module.exports = function(ctx) {
	ctx.end(ctx.view("viewer", {
		header: ctx.template("header")
	}));
}
