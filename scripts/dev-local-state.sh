#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

print_help() {
  cat <<-EOF

	Runs a local replica with state as saved by 
  https://github.com/dfinity/snsdemo/blob/main/bin/dfx-state-save .
  Then it runs a local frontend and waits for the user to interact with it.
  When the user is done, the script stops the replica and restores original the
  state.

  The script replaces existing dfx directories after moving them to a backup.
  So if things go wrong this is potentially dangerous for your dfx state.
  A restore scripts is placed in the backup directory, which might be helpful in
  such cases.
	EOF
}

# Source the clap.bash file ---------------------------------------------------
source "$SOURCE_DIR/clap.bash"
# Define options
clap.define short=z long=state-zip desc="The state .zip file" variable=STATE_ZIP_FILE default="state.zip"
clap.define short=c long=clean desc="Extract a clean state from the .zip file, even if a directory with extracted state exists" variable=CLEAN nargs=0 default="false"
# Source the output file ----------------------------------------------------------
source "$(clap.build)"

# The $() causes an extra entry in the output of `ps` so without any other script
# running, this will be 2.
# We use `ps` because pgrep doesn't include shell scripts.
# shellcheck disable=SC2009
SCRIPT_COUNT="$(ps -A -o command | grep -c "^bash .*$(basename $0)")"

if pgrep replica || [ "$SCRIPT_COUNT" -gt 2 ]; then
  echo "ERROR: There is already a replica running. Please stop it first."
  exit 1
fi

if [ ! -f "$STATE_ZIP_FILE" ]; then
  echo "State file $STATE_ZIP_FILE does not exist. Use --state-zip to specify a state .zip file as generated by dfx-state-save in the snsdemo repo."
  exit 1
fi

STATE_HASH="$(sha256sum "$STATE_ZIP_FILE" | cut -d' ' -f1)"

STATE_DIR="$(dfx cache show)/snsdemo-state-$STATE_HASH"

if [ -d "$STATE_DIR" ] && [ "$CLEAN" = "false" ]; then
  echo "Reusing existing state in $STATE_DIR"
else
  if [ -d "$STATE_DIR" ]; then
    echo "Removing existing state in $STATE_DIR"
    rm -rf "$STATE_DIR"
  fi
  echo "Extracting state into $STATE_DIR"
  mkdir -p "$STATE_DIR"
  unzip "$STATE_ZIP_FILE" -d "$STATE_DIR"
fi

TOP_DIR=$(git rev-parse --show-toplevel)

if [ "$(uname)" = "Darwin" ]; then
  RELATIVE_DFX_DATA_DIR="Library/Application Support/org.dfinity.dfx/network/local"
else
  RELATIVE_DFX_DATA_DIR=".local/share/dfx/network/local"
fi

# DFX_DATA_DIR is used by get_dfx_dir.
# shellcheck disable=SC2034
DFX_DATA_DIR="$HOME/$RELATIVE_DFX_DATA_DIR"
# DFX_DATA_STATE_DIR is used by get_state_dir.
# shellcheck disable=SC2034
DFX_DATA_STATE_DIR="$STATE_DIR/$RELATIVE_DFX_DATA_DIR"

# DFX_CONFIG_DIR is used by get_dfx_dir.
# shellcheck disable=SC2034
DFX_CONFIG_DIR="$HOME/.config/dfx"
# DFX_NETWORK_DIR is used by get_dfx_dir.
# shellcheck disable=SC2034
DFX_NETWORK_DIR="$TOP_DIR/.dfx"

BACKUP_DIR="$HOME/dfx-state-backup-$(date +"%Y%m%d_%H%M%S")"
mkdir -p "$BACKUP_DIR"

# DFX_DATA_BACKUP_DIR is used by get_backup_dir.
# shellcheck disable=SC2034
DFX_DATA_BACKUP_DIR="$BACKUP_DIR/data"
# DFX_CONFIG_BACKUP_DIR is used by get_backup_dir.
# shellcheck disable=SC2034
DFX_CONFIG_BACKUP_DIR="$BACKUP_DIR/config"
# DFX_NETWORK_BACKUP_DIR is used by get_backup_dir.
# shellcheck disable=SC2034
DFX_NETWORK_BACKUP_DIR="$BACKUP_DIR/network"

# DFX_CONFIG_STATE_DIR is used by get_state_dir.
# shellcheck disable=SC2034
DFX_CONFIG_STATE_DIR="$STATE_DIR/.config/dfx"
# DFX_NETWORK_STATE_DIR is used by get_state_dir.
# shellcheck disable=SC2034
DFX_NETWORK_STATE_DIR="$STATE_DIR/.dfx"

# Takes "DATA", "CONFIG", or "NETWORK" as argument and returns the value of
# $DFX_DATA_DIR, $DFX_CONFIG_DIR, or $DFX_NETWORK_DIR correspondingly.
get_dfx_dir() {
  var_name="DFX_${1}_DIR"
  echo "${!var_name}"
}

# Takes "DATA", "CONFIG", or "NETWORK" as argument and returns the value of
# $DFX_DATA_BACKUP_DIR, $DFX_CONFIG_BACKUP_DIR, or $DFX_NETWORK_BACKUP_DIR
# correspondingly.
get_backup_dir() {
  var_name="DFX_${1}_BACKUP_DIR"
  echo "${!var_name}"
}

# Takes "DATA", "CONFIG", or "NETWORK" as argument and returns the value of
# $DFX_DATA_STATE_DIR, $DFX_CONFIG_STATE_DIR, or $DFX_NETWORK_STATE_DIR
# correspondingly.
get_state_dir() {
  var_name="DFX_${1}_STATE_DIR"
  echo "${!var_name}"
}

# Moves $2 to $3 and then $1 to $2.
# Returns an error if $3 already exists but silently skips moves for which the
# source doesn't exist.
mv3() {
  if [ -e "$3" ]; then
    echo "$3 already exists"
    return 1
  fi
  if [ -e "$2" ]; then
    echo mv "'$2'" "'$3'"
    mv "$2" "$3"
  fi
  if [ -e "$1" ]; then
    echo mv "'$1'" "'$2'"
    mv "$1" "$2"
  fi
}

# Takes "DATA", "CONFIG", or "NETWORK" as argument and moves the corresponding
# directory to the backup location and the corresponding state directory in its
# place.
install_dir() {
  state_dir="$(get_state_dir "$1")"
  dfx_dir="$(get_dfx_dir "$1")"
  backup_dir="$(get_backup_dir "$1")"
  mv3 "$state_dir" "$dfx_dir" "$backup_dir"
}

# Takes "DATA", "CONFIG", or "NETWORK" as argument and outputs the commands to
# restore the corresponding directory from the backup location after moving the
# state directory back to its original location.
output_restore_dir() {
  state_dir="$(get_state_dir "$1")"
  dfx_dir="$(get_dfx_dir "$1")"
  backup_dir="$(get_backup_dir "$1")"
  printf 'mv %q %q\n' "$dfx_dir" "$state_dir"
  printf 'mv %q %q\n' "$backup_dir" "$dfx_dir"
}

# Moves all the existing directories to the backup location and moves the state
# directories in their place.
install_state() {
  install_dir DATA
  install_dir CONFIG
  install_dir NETWORK
}

output_restore_backup_script() {
  echo "echo \"Restoring dfx state.\""
  echo set -xeu
  output_restore_dir DATA
  output_restore_dir CONFIG
  output_restore_dir NETWORK
  echo rm "\$0"
  echo rmdir "$BACKUP_DIR"
}

# We put the backup script inside the backup directory.
# So if for whatever reason the script fails to restore the backup, we can
# manually call the script to resore the backup.
RESTORE_BACKUP_SCRIPT_FILE="$BACKUP_DIR/restore.sh"
output_restore_backup_script >"$RESTORE_BACKUP_SCRIPT_FILE"

restore_backup() {
  sh "$RESTORE_BACKUP_SCRIPT_FILE"
}

# Restore the backup if the script fails or exists successfully.
trap restore_backup EXIT

install_state

# Change to $HOME to avoid using nns-dapp dfx.json.
cd "$HOME"
echo "*********************************************************************"
echo "*                                                                   *"
echo "*  If the state was generated on a different type of machine, then  *"
echo "*  starting the replica may just hang after a panic.                *"
echo "*                                                                   *"
echo "*********************************************************************"
dfx start --background
echo "***********************************************************"
echo "*                                                         *"
echo "*  Fortunately, it did not hang. This may actually work!  *"
echo "*                                                         *"
echo "***********************************************************"

# Run frontend development server.
cd "$TOP_DIR"
DFX_NETWORK=local ./config.sh
cd frontend
npm ci
npm run dev

cd "$HOME"
dfx stop

# Wait for the replica to stop before moving state around.
while pgrep replica; do sleep 1; done

# The trap set above will restore the state before this script exits.
