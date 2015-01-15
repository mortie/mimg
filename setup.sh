#!/bin/sh

commands_missing=0
check_exists()
{
	which "$1" 1> /dev/null
	if [ "$?" -ne 0 ]; then
		commands_missing=1
		echo "Missing command: $1"
	fi
}

check_exists "zsh"
check_exists "tmux"
check_exists "vim"
check_exists "python"
check_exists "xdotool"
check_exists "i3"
check_exists "compton"
check_exists "amixer"
check_exists "xbacklight"
check_exists "feh"

if [ $commands_missing -ne 0 ]; then
	echo "Some commands are missing. Continue? (y/n)"
	read response
	if [ "$response" != "y" ]; then
		echo "Aborting."
		exit 1
	fi
fi

echo "Copying dotfiles..."
cd dotfiles
for f in *; do
	rm -rf "$HOME/.$f"
	cp -r "$f" "$HOME/.$f"
done
cd ..
echo "Done."

echo "Copying executables..."
mkdir -p "$HOME/bin"
cd bin
for f in *; do
	rm -rf "$HOME/bin/$f"
	cp -r "$f" "$HOME/bin/$f"
done
cd ..
echo "Done."

echo "Everything set up!"
