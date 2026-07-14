import { HypersyncClient, Decoder } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const MAX_EVENTS = Number(process.env.MAX_EVENTS || 20);
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const TRANSFER =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const client = new HypersyncClient({
  url: "https://eth.hypersync.xyz",
  apiToken,
});

const decoder = Decoder.fromSignatures([
  "Transfer(address indexed from, address indexed to, uint256 value)",
]);

const height = await client.getHeight();
let query = {
  fromBlock: Math.max(0, height - 1500),
  logs: [{ address: [USDC], topics: [[TRANSFER]] }],
  fieldSelection: {
    log: ["Address", "Data", "Topic0", "Topic1", "Topic2", "BlockNumber"],
  },
};

const stream = await client.stream(query, {});
let count = 0;

while (count < MAX_EVENTS) {
  const res = await stream.recv();
  if (res === null) break;
  if (!res.data?.logs?.length) {
    query.fromBlock = res.nextBlock;
    continue;
  }
  const decoded = await decoder.decodeLogs(res.data.logs);
  for (let i = 0; i < decoded.length && count < MAX_EVENTS; i++) {
    const d = decoded[i];
    if (!d) continue;
    const from = d.indexed[0]?.val?.toString?.() ?? "?";
    const to = d.indexed[1]?.val?.toString?.() ?? "?";
    const value = d.body[0]?.val?.toString?.() ?? "0";
    console.log(`Transfer ${from} -> ${to} value=${value}`);
    count += 1;
  }
  query.fromBlock = res.nextBlock;
}

await stream.close?.();
console.log(`Done. decoded=${count}`);
