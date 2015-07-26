module.exports = function(ctx) {
	ctx.getPostData(function(err, data, files) {
		if (err) return console.log(err);

		ctx.succeed();
	});
}
