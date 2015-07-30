$(document).on("ready", function() {
	$("#collections .date-created").each(function() {
		this.innerHTML = util.dateToString(new Date(this.innerHTML));
	});
});
