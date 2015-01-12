#!/bin/sh

check_exists()
{
	which "$1" 1> /dev/null
	if [ "$?" -ne 0 ]; then
		echo "Warning: Missing command: ${1}. Continue? (y/n)"
		read response
		if [ "$response" != "y" ]; then
			echo "Aborting."
			exit 1
		fi
	fi
}

check_exists "zsh"
check_exists "i3"
check_exists "tmux"
check_exists "vim"
check_exists "compton"

echo "copying dotfiles..."
cd dotfiles
for f in *; do
	rm -r "$HOME/.$f"
	cp -r "$f" "$HOME/.$f"
done
cd ..
echo "done"
