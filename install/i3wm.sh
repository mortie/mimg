echo "am install i3 for OS $OS"

case $OS in
ubuntu)
	printf "%s\n" \
		"Package: i3*" \
		"Pin: origin \"build.i3wm.org\"" \
		"Pin-Priority: 1001" \
		| sudo tee /etc/apt/preferences.d/00-i3-autobuild.pref > /dev/null

	sudo apt-get update
	sudo apt-get install i3 -y
	;;
*)
	exit 1
	;;
esac
