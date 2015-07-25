(function() {
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		notify("Your Browser Sucks.");
	}

	function draw(files) {
		var output = [];
		files.forEach(function(f, i) {
			output.push(
				'<li class="file list-group-item" data-index='+i+'>'+
					'<span class="name">'+util.htmlEntities(f.name)+'</span>'+
					'<button class="btn btn-default delete" onclick="uploaderDelete(this.parentNode)">X</button>'+
				'</li>'
			);
		});
		$("#uploader-list").html(output.join(""));
	}

	var files = [];

	$("#uploader-input").on("change", function(evt) {
		var inputFiles = evt.target.files;

		for (var i = 0; i < inputFiles.length; ++i) {
			files.push(inputFiles[i]);
		}

		draw(files);
	});

	window.uploaderDelete = function(elem) {
		var index = elem.getAttribute("data-index");
		delete files[index];
		draw(files);
	}

	$("#uploader-upload").on("click", function(evt) {
		console.log(output);
	});
})();
