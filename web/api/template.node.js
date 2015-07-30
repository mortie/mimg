module.exports = function(ctx) {
	var name = ctx.query;
	if (!name)
		return ctx.fail("You must supply a template name.");

	ctx.getPostData(function(err, data) {
		if (err)
			return ctx.fail(err);

		try {
			ctx.succeed({
				html: ctx.template(name, data)
			});
		} catch (err) {
			ctx.fail(err);
		}
	});
}
