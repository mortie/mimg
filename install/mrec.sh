res=$(xdpyinfo | awk '/dimensions:/ { print $2; exit }')

echo "X=0" >> "$HOME/.mrecrc"
echo "Y=0" >> "$HOME/.mrecrc"
echo "W=$(echo $res | cut -d x -f 1)" >> "$HOME/.mrecrc"
echo "H=$(echo $res | cut -d x -f 2)" >> "$HOME/.mrecrc"
