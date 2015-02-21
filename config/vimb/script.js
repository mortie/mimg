document.addEventListener('DOMContentLoaded', function()
{
	if (window.location.href.match("youtube.com/watch"))
		document.getElementById("player").innerHTML = "";
}, false);
