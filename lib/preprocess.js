var valueRegex = "([a-zA-Z0-9_\\-]+)#([a-zA-Z0-9_\\-]+)";

var regexStr =
	"{{"+               //{{
	valueRegex+         //foo#bar - $1#$2
	"(?:"+              //<optional>
		" \\? "+            //?
		valueRegex+         //foo#bar - $3#$4
		" : "+              //:
		valueRegex+         //foo#bar - $5#$6
	")?"+               //</optional>
	"}}";               //}}

var localRegex = new RegExp(regexStr);
var globalRegex = new RegExp(regexStr, "g");

function getVal(ns, key, env) {
	var n = env[ns];

	if (typeof n === "function")
		return n(key);
	else if (n)
		return n[key];
	else
		throw new Error("Namespace "+ns+" doesn't exist.");
}

module.exports = function(str, env) {
	var placeholders = str.match(globalRegex);

	if (!placeholders)
		return str;

	placeholders.forEach(function(p) {
		var parts = p.match(localRegex);
		var s = parts[0];

		//Ternary
		if (parts[6]) {
			try {
				var cond = getVal(parts[1], parts[2], env);
				var val1 = getVal(parts[3], parts[4], env);
				var val2 = getVal(parts[5], parts[6], env);
			} catch (err) {
				return;
			}

			if (cond === true)
				str = str.replace(s, val1);
			else
				str = str.replace(s, val2);
		}

		//Direct value
		else {
			try {
				var val = getVal(parts[1], parts[2], env);
			} catch (err) {
				return;
			}

			if (val !== undefined && val !== null)
				str = str.replace(s, val);
		}
	});

	return str;
}
