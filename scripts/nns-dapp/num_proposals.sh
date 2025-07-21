#!/usr/bin/env bash

set -euo pipefail

OUTPUT_FILE="executed_proposals.csv"
export DFX_WARNING="-mainnet_plaintext_identity"
MAX_NAT64="18446744073709551615 : nat64"

echo "============================================"
echo "Fetching SNS list (single request)…"
echo "============================================"

response=$(curl -s "https://sns-api.internetcomputer.org/api/v1/snses?max_sns_index=999&offset=0&limit=100&include_swap_lifecycle=LIFECYCLE_COMMITTED")

mapfile -t ENTRIES < <(echo "$response" | jq -c '.data[] | {root: .root_canister_id, name: .name}')

total_entries=${#ENTRIES[@]}
echo "► Found $total_entries committed SNS projects."
echo

echo "name,executed_proposals" > "$OUTPUT_FILE"
total_sum=0
index=0

for entry in "${ENTRIES[@]}"; do
  index=$((index + 1))
  root_id=$(jq -r '.root' <<<"$entry")
  name=$(jq -r '.name' <<<"$entry")

  printf "[%02d/%d] %-30s " "$index" "$total_entries" "$name"

  # Governance canister ID
  gov=$(curl -s "https://sns-api.internetcomputer.org/api/v1/snses/$root_id" \
        | jq -r '.governance_canister_id')

  if [[ -z "$gov" || "$gov" == "null" ]]; then
    echo "⛔  no governance_id"
    echo "$name,ERROR_NO_GOV_ID" >> "$OUTPUT_FILE"
    continue
  fi

  printf "→ get_metrics … "
  if ! raw=$(dfx canister --ic call "$gov" \
            get_metrics "(record { time_window_seconds = opt ($MAX_NAT64) })" 2>/dev/null); then
    echo "⛔  call failed"
    echo "$name,ERROR_CALL_FAILED" >> "$OUTPUT_FILE"
    continue
  fi

  if ! json=$(echo "$raw" | idl2json 2>/dev/null); then
    echo "⛔  idl2json failed"
    echo "$name,ERROR_JSON_FAILED" >> "$OUTPUT_FILE"
    continue
  fi

  num=$(echo "$json" \
        | jq -r '.get_metrics_result[0].Ok.num_recently_executed_proposals[0]' 2>/dev/null)

  if [[ -z "$num" || "$num" == "null" ]]; then
    echo "⛔  parse failed"
    echo "$name,ERROR_PARSE_FAILED" >> "$OUTPUT_FILE"
    continue
  fi

  echo "✅  $num"
  echo "$name,$num" >> "$OUTPUT_FILE"
  total_sum=$((total_sum + num))
done

echo "Total,$total_sum" >> "$OUTPUT_FILE"

echo
echo "============================================"
echo "Finished ✔  CSV written to $OUTPUT_FILE"
echo "Total num_recently_executed_proposals = $total_sum"
echo "============================================"
