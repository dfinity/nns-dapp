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
clap.define short=s long=snapshot desc="The snapshot .zip or .tar.xz file" variable=SNAPSHOT_ARCHIVE default="snapshot.tar.xz"
clap.define short=c long=clean desc="Extract a clean state from the .zip file, even if a directory with extracted state exists" variable=CLEAN nargs=0 default="false"
# Source the output file ----------------------------------------------------------
source "$(clap.build)"

# The $() causes an extra entry in the output of `ps` so without any other script
# running, this will be 2.
# We use `ps` because pgrep doesn't include shell scripts.
# shellcheck disable=SC2009
SCRIPT_COUNT="$(ps -A -o command | grep -c "^bash .*$(basename "$0")")"

if pgrep replica || [ "$SCRIPT_COUNT" -gt 2 ]; then
  echo "ERROR: There is already a replica running. Please stop it first."
  exit 1
fi

BACKUP_DIR="$HOME/dfx-state-backup-$(date +%s)"

TOP_DIR=$(git rev-parse --show-toplevel)

RESTORE_BACKUP_SCRIPT_FILE="$BACKUP_DIR/restore.sh"

restore_backup() {
  sh "$RESTORE_BACKUP_SCRIPT_FILE"
}

# Restore the backup if the script fails or exists successfully.
trap restore_backup EXIT

CLEAN_ARG=""
if [ "$CLEAN" != "false" ]; then
  CLEAN_ARG="--clean"
fi

"$SOURCE_DIR/dfx-snapshot-install" --backup-dir "$BACKUP_DIR" --snapshot "$SNAPSHOT_ARCHIVE" "$CLEAN_ARG"

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

# If there are any errors below we still want to stop the replica before
# restoring the state.
set +e

# Run frontend development server.
cd "$TOP_DIR"
DFX_NETWORK=local ./config.sh
# cd frontend
# npm ci
# npm run dev

cd "$HOME"
dfx stop

# Wait for the replica to stop before moving state around.
while pgrep replica; do sleep 1; done

# The trap set above will restore the state before this script exits.
