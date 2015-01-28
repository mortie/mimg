#!/bin/bash

issues=0
check_command()
{
	which "$1" 1> /dev/null
	if [ "$?" -ne 0 ]; then
		issues=1
		echo "Missing command: $1"
	fi
}

issues=0
check_file()
{
	if [ ! -f "$1" ]; then
		issues=1
		echo "Missing file: $1"
	fi
}

check_command "zsh"
check_command "tmux"
check_command "vim"
check_command "python"
check_command "xdotool"
check_command "i3"
check_command "compton"
check_command "amixer"
check_command "xbacklight"
check_command "feh"
check_command "xclip"
check_command "xsel"
check_command "byzanz-record"

check_file ~/.mrecrc

if [ $issues -ne 0 ]; then
	echo "Some commands or files are missing. Continue? (y/n)"
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
