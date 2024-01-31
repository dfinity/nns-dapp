#!/bin/bash
set -euo pipefail

# Path to the directory where the JSON files live
TEST_FILES_PATH="./frontend/src/tests/workflows/Launchpad"

# Base URL of the API
BASE_URL="https://3r4gx-wqaaa-aaaaq-aaaia-cai.icp0.io/v1/sns/list/page"

# Loop until an error is received
for ((page=0; ; page++)); do
  # Construct the URL
  url="${BASE_URL}/${page}/slow.json"
  output="${TEST_FILES_PATH}/sns-agg-page-${page}.json"

  if curl -fsSL "$url" | jq . >"$output"; then
    echo "Downloaded page ${page}."
  else
    echo "Stopped at page ${page}."
    rm "$output"
    break
  fi
done

echo "All pages downloaded."
