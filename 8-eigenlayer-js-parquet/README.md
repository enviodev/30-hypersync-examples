### Hypersync Client Script for Ethereum Event Logs

This script uses the Hypersync Client to fetch Ethereum event logs related to pool creation events.

#### Prerequisites

- Node.js installed on your machine

#### Installation and Usage

1. **Install necessary dependencies:**

   ```sh
   npm install
   ```

2. **Run the script:**
   ```sh
   node get-pools.js
   ```

#### Explanation of the Script

- **Dependencies:**

  ```javascript
  import { keccak256, toHex } from "viem";
  import { HypersyncClient } from "@envio-dev/hypersync-client";
  ```

- **Event Signature:**
  The script listens for `PoolCreated` events (Uniswap v3), which are identified by the following signature:

  ```javascript
  const event_signatures = [
    "PoolCreated(address,address,uint24,int24,address)",
  ];
  ```

- **Generate Topic0 Values:**
  Generate the keccak256 hash of the event signature to get the topic0 values:

  ```javascript
  const topic0_list = event_signatures.map((sig) => keccak256(toHex(sig)));
  ```

- **Initialize Hypersync Client:**
  Create a new instance of the Hypersync client:

  ```javascript
  const client = HypersyncClient.new({
    url: "http://eth.hypersync.xyz",
  });
  ```

- **Query Setup:**
  Define the query to fetch logs from the beginning of the blockchain:

  ```javascript
  let query = {
    fromBlock: 0,
    logs: [
      {
        topics: [topic0_list],
      },
    ],
    fieldSelection: {
      block: ["number", "timestamp", "hash"],
      log: [
        "block_number",
        "log_index",
        "transaction_index",
        "transaction_hash",
        "data",
        "address",
        "topic0",
        "topic1",
        "topic2",
        "topic3",
      ],
      transaction: ["from"],
    },
  };
  ```

- **Main Function:**
  The main function handles sending initial requests and streaming events:

  ```javascript
  const main = async () => {
    let eventCount = 0;
    const startTime = performance.now();

    const res = await client.sendEventsReq(query);
    eventCount += res.events.length;
    query.fromBlock = res.nextBlock;

    const stream = await client.streamEvents(query, {
      retry: true,
      batchSize: 10000,
      concurrency: 12,
    });

    while (true) {
      const res = await stream.recv();
      if (res === null) {
        console.log(`reached the tip`);
        break;
      }
      eventCount += res.events.length;

      const currentTime = performance.now();
      const seconds = (currentTime - startTime) / 1000;

      console.log(
        `scanned up to ${
          res.nextBlock
        } and got ${eventCount} events. ${seconds} seconds elapsed. Blocks per second: ${
          res.nextBlock / seconds
        }`
      );
    }
  };

  main();
  ```

This script is designed to efficiently query and stream Ethereum blockchain events related to pool creation, leveraging the parallel processing capabilities of the Hypersync client.
