import { keccak256, toHex } from "viem";
import { HypersyncClient } from "@envio-dev/hypersync-client";


const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error(
    "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
  );
  process.exit(1);
}

const event_signatures = ["BlockVerification(uint32)", "BlockCommit(uint32)"];

const topic0_list = event_signatures.map((sig) => keccak256(toHex(sig)));

console.log(topic0_list);
const client = new HypersyncClient({
  url: "https://eth.hypersync.xyz",
  apiToken: apiToken,
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
      "Removed",
      // "BlockNumber",
      // "LogIndex",
      // "TransactionIndex",
      // "TransactionHash",
      // "Data",
      // "Address",
      // "Topic0",
      // "Topic1",
      // "Topic2",
      // "Topic3",
    ],
    // transaction: ["From"],
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
