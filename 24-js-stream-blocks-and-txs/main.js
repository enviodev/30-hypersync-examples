import {
  HypersyncClient,
  presetQueryBlocksAndTransactions,
} from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const MAX_BATCHES = Number(process.env.MAX_BATCHES || 5);
const client = new HypersyncClient({
  url: "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const fromBlock = Math.max(0, height - 30);
let query = presetQueryBlocksAndTransactions(fromBlock, height);

const stream = await client.stream(query, {});
let batches = 0;
let blocks = 0;
let txs = 0;

while (batches < MAX_BATCHES) {
  const res = await stream.recv();
  if (res === null) break;
  const b = res.data?.blocks?.length ?? 0;
  const t = res.data?.transactions?.length ?? 0;
  blocks += b;
  txs += t;
  batches += 1;
  console.log(
    `batch=${batches} nextBlock=${res.nextBlock} blocks=${b} txs=${t}`
  );
  query = { ...query, fromBlock: res.nextBlock };
}

await stream.close?.();
console.log(`Done. blocks=${blocks} txs=${txs}`);
