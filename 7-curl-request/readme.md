Here's a simple README for your Day 7 of the HyperSync Curl examples:

## Curl in HyperSync 🤓

### Overview

We're diving into the power of curl commands to interact with HyperSync's robust API. With just a single command, you can fetch all ERC20 transfers and transactions to and from any specified address.

### Prerequisites

- Ensure you have `curl` installed on your terminal. If not, you can install it by visiting [Curl Installation Guide](https://curl.se/download.html).

### Usage Instructions

1. **Prepare the Command:**
   Modify the command below by replacing the placeholder address with the actual Ethereum address you're interested in.

2. **Execute the Command:**
   Copy and paste the following command into your terminal:

```bash
curl --request POST  \
  --url https://base.hypersync.xyz/query \
  --header 'Content-Type: application/json' \
  --data '{
    "from_block": 0,
    "logs": [
      {
        "topics": [
          ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
          [],
          ["0x0000000000000000000000001e037f97d730Cc881e77F01E409D828b0bb14de0"]
        ]
      },
      {
        "topics": [
          ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
          ["0x0000000000000000000000001e037f97d730Cc881e77F01E409D828b0bb14de0"],
          []
        ]
      }
    ],
    "transactions": [
      {
        "from": ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"]
      },
      {
        "to": ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"]
      }
    ],
    "field_selection": {
      "block": ["number", "timestamp", "hash"],
      "log": ["block_number", "log_index", "transaction_index", "data", "address", "topic0", "topic1", "topic2", "topic3"],
      "transaction": ["block_number", "transaction_index", "hash", "from", "to", "value", "input"]
    }
  }'
```

### Tips

- Remember, curl is using JSON https so it won't be as effcient as a binary data transfer using the client directly (but its still really fast).
- Feel free to adjust the JSON payload to fit different types of blockchain data queries.
