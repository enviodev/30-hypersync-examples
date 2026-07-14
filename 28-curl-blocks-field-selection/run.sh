#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${ENVIO_API_TOKEN:-}" ]]; then
  echo "Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens" >&2
  exit 1
fi

FROM_BLOCK="${FROM_BLOCK:-19000000}"
TO_BLOCK="${TO_BLOCK:-19000005}"

curl -sS "https://eth.hypersync.xyz/query"   --header "Authorization: Bearer ${ENVIO_API_TOKEN}"   --header "Content-Type: application/json"   --data @- <<EOF
{
  "from_block": ${FROM_BLOCK},
  "to_block": ${TO_BLOCK},
  "include_all_blocks": true,
  "field_selection": {
    "block": ["number", "hash", "timestamp"]
  }
}
EOF
echo
