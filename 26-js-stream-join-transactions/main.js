import { HypersyncClient, JoinMode } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const MAX_BATCHES = Number(process.env.MAX_BATCHES || 3);
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const TRANSFER =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const client = new HypersyncClient({
  url: "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
let query = {
  fromBlock: Math.max(0, height - 800),
  joinMode: JoinMode.JoinTransactions,
  logs: [{ address: [USDC], topics: [[TRANSFER]] }],
  fieldSelection: {
    log: ["Address", "Topic0", "TransactionHash", "BlockNumber"],
    transaction: ["Hash", "From", "To", "Value"],
  },
};

const stream = await client.stream(query, {});
let batches = 0;
while (batches < MAX_BATCHES) {
  const res = await stream.recv();
  if (res === null) break;
  console.log(
    `batch=${batches + 1} logs=${res.data?.logs?.length ?? 0} txs=${
      res.data?.transactions?.length ?? 0
    } nextBlock=${res.nextBlock}`
  );
  batches += 1;
  query.fromBlock = res.nextBlock;
}
await stream.close?.();
console.log("Done");
