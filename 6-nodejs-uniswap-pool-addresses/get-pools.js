import { keccak256, toHex } from "viem";
import { HypersyncClient } from "@envio-dev/hypersync-client";

const event_signatures = ["PoolCreated(address,address,uint24,int24,address)"];

const topic0_list = event_signatures.map((sig) => keccak256(toHex(sig)));

console.log(topic0_list);

const client = HypersyncClient.new({
  url: "http://eth.hypersync.xyz",
});

let query = {
  fromBlock: 0,
  logs: [
    {
      // Get all events that have any of the topic0 values we want
      topics: [topic0_list],
    },
  ],
  fieldSelection: {
    // block: ["number", "timestamp", "hash"],
    log: [
      "block_number",
      // NOTE: No need to include all thees other fields as they don't matterfor the count.
      // "log_index",
      // "transaction_index",
      // "transaction_hash",
      // "data",
      // "address",
      // "topic0",
      // "topic1",
      // "topic2",
      // "topic3",
    ],
    // transaction: ["from"],
  },
};

const main = async () => {
  let eventCount = 0;
  const startTime = performance.now();

  // Send an initial non-parallelized request to find first events
  const res = await client.get(query);
  eventCount += res.data.logs.length;
  query.fromBlock = res.nextBlock;

  // Start streaming events in parallel
  const stream = await client.streamEvents(query, {
    retry: true,
    batchSize: 10000,
    concurrency: 12,
  });

  while (true) {
    const res = await stream.recv();

    // Quit if we reached the tip
    if (res === null) {
      console.log(`reached the tip`);
      break;
    }

    eventCount += res.data.length; // There is one data point per log.

    const currentTime = performance.now();

    const seconds = (currentTime - startTime) / 1000;

    console.log(
      `scanned up to ${res.nextBlock
      } and got ${eventCount} events. ${seconds} seconds elapsed. Blocks per second: ${res.nextBlock / seconds
      }`
    );
  }
};

main();
