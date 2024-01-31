#!/bin/bash
set -euo pipefail

test_files_base_path="./frontend/src/tests/workflows/Launchpad"

# Base URL of the API
base_url="https://3r4gx-wqaaa-aaaaq-aaaia-cai.icp0.io/v1/sns/list/page"

# Starting page number
page=0

# Loop until an empty or error response is received
while :; do
  # Construct the URL
  url="${base_url}/${page}/slow.json"
  output="${test_files_base_path}/sns-agg-page-${page}.json"

  if curl -fsSL "$url" | jq . >"$output"; then
    echo "Downloaded page ${page}."
  else
    echo "Stopped at page ${page}."
    rm "$output"
    break
  fi

  # Increment the page number
  page=$((page + 1))
done

echo "All pages downloaded."
