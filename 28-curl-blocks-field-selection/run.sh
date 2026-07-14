#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${ENVIO_API_TOKEN:-}" ]]; then
  echo "Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens" >&2
  exit 1
fi

FROM_BLOCK="${FROM_BLOCK:-19000000}"
TO_BLOCK="${TO_BLOCK:-19000005}"
URL="${HYPERSYNC_URL:-https://eth.hypersync.xyz}"
MINIMAL_FILE="$(mktemp)"
FULL_FILE="$(mktemp)"
trap 'rm -f "$MINIMAL_FILE" "$FULL_FILE"' EXIT

query() {
  local output="$1"
  local fields="$2"
  curl -sS "$URL/query" \
    --header "Authorization: Bearer ${ENVIO_API_TOKEN}" \
    --header "Content-Type: application/json" \
    --output "$output" \
    --data @- <<EOF
{
  "from_block": ${FROM_BLOCK},
  "to_block": ${TO_BLOCK},
  "include_all_blocks": true,
  "field_selection": {
    "block": ${fields}
  }
}
EOF
}

query "$MINIMAL_FILE" '["number", "hash", "timestamp"]'
query "$FULL_FILE" '["number", "hash", "parent_hash", "nonce", "sha3_uncles", "logs_bloom", "transactions_root", "state_root", "receipts_root", "miner", "difficulty", "total_difficulty", "extra_data", "size", "gas_limit", "gas_used", "timestamp", "base_fee_per_gas"]'

minimal_bytes="$(wc -c < "$MINIMAL_FILE" | tr -d ' ')"
full_bytes="$(wc -c < "$FULL_FILE" | tr -d ' ')"
printf 'Minimal field selection: %s bytes\n' "$minimal_bytes"
printf 'Broad field selection:   %s bytes\n' "$full_bytes"

if command -v jq >/dev/null 2>&1; then
  # Raw HTTP responses contain one or more data batches.
  jq '.data[0].blocks[0]' "$MINIMAL_FILE"
else
  python3 -m json.tool "$MINIMAL_FILE"
fi
