var vals = {
	env: "[^\\s}]+#[^\\s}]+",
	string: "\"[^\"}]+\""
}

//Get regex for all values
var valueRegex =
	Object.keys(vals)
	.map(function(i) { return vals[i]; })
	.join("|");

//Turn value regex strings into actual regexes
Object.keys(vals).forEach(function(i) {
	vals[i] = new RegExp(vals[i]);
});

var regexStr =
	"{{"+               //{{
	"("+valueRegex+")"+ //value - $1
	"(?:"+              //<optional>
		" \\? "+            //?
		"("+valueRegex+")"+ //value - $2
		" : "+              //:
		"("+valueRegex+")"+ //value - $3
	")?"+               //</optional>
	"}}";               //}}

var localRegex = new RegExp(regexStr);
var globalRegex = new RegExp(regexStr, "g");

function getVal(str, env) {
	if (vals.env.test(str)) {
		var parts = str.split("#");
		var ns = env[parts[0]];

		if (typeof ns === "function")
			return ns(parts[1]);
		else if (ns !== undefined)
			return ns[parts[1]];
		else
			throw new Error("No: "+str);
	} else if (vals.string.test(str)) {
		return str.substring(1, str.length - 1);
	}
}

module.exports = function(str, env) {
	var placeholders = str.match(globalRegex);

	if (!placeholders)
		return str;

	placeholders.forEach(function(p) {
		var parts = p.match(localRegex);
		var s = parts[0];

		//Ternary
		if (parts[3]) {
			try {
				var cond = getVal(parts[1], env);
				var val1 = getVal(parts[2], env);
				var val2 = getVal(parts[3], env);
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
				var val = getVal(parts[1], env);
			} catch (err) {
				return;
			}

			if (val !== undefined && val !== null)
				str = str.replace(s, val);
		}
	});

	return str;
}
