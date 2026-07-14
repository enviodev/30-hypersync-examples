# 07 — Raw wallet query with curl

Fetch ERC-20 transfers and direct transactions for a wallet with one JSON request and no SDK.

**Concepts:** raw `/query`, OR selections, topic-encoded addresses, field selection.

```bash
export ENVIO_API_TOKEN=...
# Copy the curl command below, or adapt it into a shell script.
```

```bash
curl --request POST \
  --url https://base.hypersync.xyz/query \
  --header "Authorization: Bearer ${ENVIO_API_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "from_block": 1000000,
    "to_block": 1000100,
    "transactions": [
      {"from": ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"]},
      {"to": ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"]}
    ],
    "field_selection": {
      "transaction": ["block_number", "hash", "from", "to", "value"]
    }
  }' | jq
```

Try another address, network, or bounded range. For automatic binary transport and pagination, use a client library.
