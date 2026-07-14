import { keccak256, toHex } from "viem";
import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error(
    "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
  );
  process.exit(1);
}

const FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const SIGNATURE = "PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)";
const TOPIC0 = keccak256(toHex("PoolCreated(address,address,uint24,int24,address)"));
const MAX_POOLS = Number(process.env.MAX_POOLS || 10);
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const confirmations = Number(process.env.CONFIRMATIONS || 12);
const query = {
  fromBlock: Number(process.env.FROM_BLOCK || 12_369_621),
  toBlock: Math.max(0, height - confirmations),
  logs: [
    {
      address: [FACTORY],
      topics: [[TOPIC0]],
    },
  ],
  fieldSelection: {
    log: ["BlockNumber", "TransactionHash", "Address", "Topic0", "Topic1", "Topic2", "Topic3", "Data"],
  },
};

const main = async () => {
  const decoder = Decoder.fromSignatures([SIGNATURE]);
  const stream = await client.stream(query, {});
  let count = 0;
  try {
    while (count < MAX_POOLS) {
      const res = await stream.recv();
      if (res === null) break;
      const decoded = await decoder.decodeLogs(res.data.logs);
      for (let i = 0; i < decoded.length && count < MAX_POOLS; i++) {
        const event = decoded[i];
        const raw = res.data.logs[i];
        if (!event || !raw) continue;
        console.log({
          block: raw.blockNumber,
          token0: event.indexed[0]?.val?.toString(),
          token1: event.indexed[1]?.val?.toString(),
          fee: event.indexed[2]?.val?.toString(),
          tickSpacing: event.body[0]?.val?.toString(),
          pool: event.body[1]?.val?.toString(),
        });
        count += 1;
      }
    }
  } finally {
    await stream.close();
  }
  console.log(`Done. decoded_pools=${count}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
