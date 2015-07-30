$(document).on("ready", function() {
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		notify("Your Browser Sucks.");
	}

	function draw(files) {
		var output = [];
		files.forEach(function(f, i) {
			output.push(
				'<li class="file list-group-item" data-index='+i+'>'+
					'<div class="progress-bar"></div>'+
					'<button class="btn btn-default delete" onclick="uploaderDelete(this.parentNode)">X</button>'+
					'<img class="thumbnail" src="'+f.thumbnail+'">'+
					'<span class="name">'+util.htmlEntities(f.name)+'</span>'+
				'</li>'
			);
		});
		$("#uploader-list").html(output.join(""));
	}

	var files = [];

	$("#uploader-input").on("change", function(evt) {
		console.log(evt);

		//Enable upload button
		$("#uploader-upload").removeAttr("disabled");

		var inputFiles = evt.target.files;

		for (var i = 0; i < inputFiles.length; ++i) (function() {
			var f = inputFiles[i];

			f.thumbnail = "";

			var reader = new FileReader();
			reader.readAsDataURL(f);
			reader.onload = function(evt) {
				f.thumbnail = reader.result;
				draw(files);
			}

			files.push(inputFiles[i]);
		})();

		draw(files);
	});

	window.uploaderDelete = function(elem) {
		var index = elem.getAttribute("data-index");
		delete files[index];
		draw(files);
	}

	//Upload things when the upload button is clicked
	$("#uploader-upload").on("click", function(evt) {

		//First, disable all buttons
		$("#uploader button.btn").prop("disabled", true);

		var elems = [];

		$("#uploader-list .file").each(function() {
			var elem = $(this);
			elems[elem.data("index")] = elem;
		});

		//First, create a collection
		util.api("collection_create", {
			name: ($("#uploader-collection-name").val() || "Collection")
		}, function(err, res) {
			if (err)
				return util.error(err);

			var collectionId = res.id;

			//Go to collection once files are uploaded
			var a = util.async(files.length, function(res) {
				if (res.error)
					util.redirect("/", 5000);
				else
					util.redirect("/view?"+collectionId);
			});

			//Loop through files, uploading them
			files.forEach(function(f, i) {
				var progressBar = elems[i].children(".progress-bar");

				//Handle progress bars
				function getXhr(xhr) {
					xhr.upload.addEventListener("progress", function(evt) {
						if (!evt.lengthComputable)
							return;

						var percent = (evt.loaded / evt.total) * 100;

						progressBar.css({width: percent+"%"});
					}, false);
				}

				//Get file extension
				var ext = f.name.split(".");
				ext = ext[ext.length - 1];

				util.api("image_create", {
					name: f.name,
					description: "An image.",
					extension: ext,
					collectionId: collectionId,
					file: f
				}, function(err, res) {
					if (err) {
						a("error", true);
						return util.error(err);
					}

					a();
				}, getXhr);
			});
		});
	});
});
