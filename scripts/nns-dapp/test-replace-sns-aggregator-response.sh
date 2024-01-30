#!/bin/bash
set -euo pipefail

base_path_test_files="./frontend/src/tests/workflows/Launchpad"

# Base URL of the API
base_url="https://3r4gx-wqaaa-aaaaq-aaaia-cai.icp0.io/v1/sns/list/page"

# Starting page number
page=0

# Loop until an empty or error response is received
while :; do
  # Construct the URL
  url="${base_url}/${page}/slow.json"

  # Fetch the data and store the HTTP status code
  response=$(curl -s -w "%{http_code}" -o ./temp.json "$url")
  http_code=$(tail -n1 <<<"$response")  # Extract the HTTP status code

  # Check if the HTTP status code is 200 (OK)
  if [ "$http_code" -ne 200 ]; then
    echo "Exiting at page ${page}. Error code ${http_code}."
    rm temp.json
    break
  fi

  # Save the data to a file
  output="${base_path_test_files}/sns-agg-page-${page}.json"
  # This will create the file if it doesn't exist, or overwrite it if it does
  echo "" >"$output"
  # Writes the data to the file already formatted
  jq . "./temp.json" >"$output"
  echo "Downloaded page ${page}."

  # Increment the page number
  ((page++))

  # Clean up temporary file
  rm temp.json
done

echo "All pages downloaded."
