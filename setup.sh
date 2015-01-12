#!/bin/sh

check_exists()
{
	which "$1" 1> /dev/null
	if [ "$?" -ne 0 ]; then
		echo "Missing command: ${1}. install it."
		exit 1
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
