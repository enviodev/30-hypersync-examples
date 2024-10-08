import { keccak256, toHex } from "viem";
import { HypersyncClient, Decoder } from "@envio-dev/hypersync-client";

const event_signatures = ["PoolCreated(address,address,uint24,int24,address)"];

const topic0_list = event_signatures.map((sig) => keccak256(toHex(sig)));

console.log(topic0_list);

let bearerToken = process.env.HYPERSYNC_BEARER_TOKEN;
if (!bearerToken) {
  console.warn("Please create a token at https://envio.dev/app/api-tokens and set the HYPERSYNC_BEARER_TOKEN environment variable. API tokens will improve the reliability of the service, and in future they may become compulsory.");
  bearerToken = "hypersync-examples-repo"; // This isn't a real token.
}

const client = HypersyncClient.new({
  url: "https://eth.hypersync.xyz",
  bearerToken: bearerToken,
});

let query = {
  fromBlock: 0,
  logs: [
    {
      topics: [topic0_list],
    },
  ],
  fieldSelection: {
    log: ["block_number"],
  },
};

const main = async () => {
  let eventCount = 0;
  const startTime = performance.now();

  while (true) {
    const res = await client.get(query);

    // Quit if we reached the tip
    if (res.data.logs.length === 0) {
      console.log(`reached the tip`);
      break;
    }

    eventCount += res.data.logs.length;
    query.fromBlock = res.nextBlock;

    const currentTime = performance.now();
    const seconds = (currentTime - startTime) / 1000;

    console.log(
      `scanned up to ${res.nextBlock
      } and got ${eventCount} events. ${seconds.toFixed(
        2
      )} seconds elapsed. Blocks per second: ${(
        res.nextBlock / seconds
      ).toFixed(2)}`
    );
  }
};

main();
