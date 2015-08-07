$(document).on("ready", function() {
	$("#collections .date-created").each(function() {
		this.innerHTML = util.dateToString(new Date(this.innerHTML));
	});

	var collections = [];
	$("#collections .collection").each(function() {
		collections[this.getAttribute("data-id")] = $(this);
	});

	$("#collections .delete").on("click", function(evt) {
		var id = evt.target.getAttribute("data-id");
		var collection = collections[id];
		var name = collection.children(".name").html();

		if (!confirm("Are you sure you want to delete collection "+name+"?"))
			return;

		util.api("collection_delete", {
			id: id
		}, function(err, res) {
			if (err)
				return util.error(err);

			collection.remove();
		});
	});
});
