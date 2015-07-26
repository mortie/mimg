(function() {
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

		//Enable upload button
		$("#uploader-upload").removeAttr("disabled")
		console.log("making uploader button not disabled");

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
		console.log("making buttons disabled");

		var elems = [];

		$("#uploader-list .file").each(function() {
			var elem = $(this);
			elems[elem.data("index")] = elem;
		});

		files.forEach(function(f, i) {
			var progressBar = elems[i].children(".progress-bar");

			function getXhr(xhr) {
				xhr.upload.addEventListener("progress", function(evt) {
					if (!evt.lengthComputable)
						return;

					var percent = (evt.loaded / evt.total) * 100;

					progressBar.css({width: percent+"%"});
				}, false);
			}

			var ajax = util.api("upload", {
				name: f.name,
				data: f
			}, function(err, res) {
				console.log(res);
			}, getXhr);
		});
	});
})();
