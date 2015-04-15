#!/bin/bash

export OS=$(awk '/DISTRIB_ID=/' /etc/*-release | sed 's/DISTRIB_ID=//' | tr '[:upper:]' '[:lower:]')

case $OS in
	ubuntu)
		;;
	*)
		echo "Unsupported OS: ${OS}."
		exit 1
esac

rm out.log &>/dev/null
mkdir .installed &>/dev/null

issues=0

check_command()
{
	which "$1" &> /dev/null
	if [ "$?" -ne 0 ]; then
		issues=1
		echo "Missing command: $1"
	fi
}

check_file()
{
	if [ ! -f "$1" ]; then
		issues=1
		echo "Missing file: $1"
	fi
}

check_dep()
{
	dep=""

	case $OS in
	ubuntu)
		case $1 in
		xcb_keysym.h)
			dep="libxcb-keysyms1-dev"
			;;
		xcb.h)
			dep="libxcb-util0-dev"
			;;
		esac
		;;
	esac

	exists=0
	case $OS in
	ubuntu)
		dpkg -s "$dep" &> /dev/null
		exists="$?"
		;;
	esac

	if [ ! $exists ]; then
		if [ "$dep" = "" ]; then
			echo "Missing dependency: $1"
		else
			echo "Missing dependency: $dep"
		fi
		issues=1
	fi
}

install_setup()
{
	if [ -f ".installed/$1" ]; then
		echo "$1 is already installed, skipping."
		return
	fi

	echo "Installing ${1}..."
	DIR=$(mktemp -d)
	CDIR=$(pwd)
	cd $DIR
	echo "\n\nINSTALL: $1" >> "$CDIR/out.log"
	sh "$CDIR/install/${1}.sh" &>> "$CDIR/out.log"
	if [ ! $? ]; then
		echo "An error occurred while installing ${1}. See out.log for more information."
	else
		touch "$CDIR/.installed/$1"
		echo "Done."
	fi
	cd "$CDIR"
}

check_command "zsh"
check_command "tmux"
check_command "vim"
check_command "python"
check_command "xdotool"
check_command "compton"
check_command "amixer"
check_command "xbacklight"
check_command "feh"
check_command "xsel"
check_command "recordmydesktop"
check_command "mplayer"
check_command "scrot"
check_command "notify-send"
check_command "dunst"
check_command "curl"
check_command "sudo"

check_dep "xcb.h"
check_dep "xcb_keysym.h"

if [ $issues -ne 0 ]; then
	echo "Some things are missing. Continue? (y/n)"
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

echo "Copying config files..."
cd config
for f in *; do
	rm -rf "$HOME/.config/$f"
	cp -r "$f" "$HOME/.config/$f"
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

echo "Copying assets..."
rm -fr "$HOME/assets"
cp -r assets "$HOME/assets"
echo "Done."

while getopts :m:f option; do
	case "$option" in
	m)
		echo "Not switching mod and alt keys."
		echo "" > ~/.Xmodmaprc
		;;
	f)
		echo "Forcing a recompile of packages."
		rm .installed/*
		;;
	*)
		echo "Unknown option: $option"
		;;
	esac
done

install_setup "sxhkd"
install_setup "i3wm"
install_setup "mrec"

if [ "$SHELL" != "/bin/zsh" ]; then
	sudo chsh "$USER" -s /bin/zsh
fi

echo "Everything set up!"
