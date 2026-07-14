import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const MAX_BATCHES = Number(process.env.MAX_BATCHES || 4);
const TRANSFER =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const wallets = [
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "0x220866B1A2219f40e72f5c628B65D54268cA3A9D",
];

const toTopic = (addr) =>
  "0x" + addr.toLowerCase().replace(/^0x/, "").padStart(64, "0");
const walletTopics = wallets.map(toTopic);

const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - 5_000),
  toBlock: safeHeight,
  // OR across selections: transfers FROM wallets OR transfers TO wallets
  logs: [
    { topics: [[TRANSFER], walletTopics] },
    { topics: [[TRANSFER], [], walletTopics] },
  ],
  fieldSelection: {
    log: ["Address", "Topic0", "Topic1", "Topic2", "Data", "BlockNumber"],
  },
};

const stream = await client.stream(query, {});
const decoder = Decoder.fromSignatures([
  "Transfer(address indexed from, address indexed to, uint256 value)",
]);
const normalizedWallets = new Set(wallets.map((wallet) => wallet.toLowerCase()));
const activity = Object.fromEntries(
  [...normalizedWallets].map((wallet) => [wallet, { in: 0, out: 0 }])
);
let batches = 0;
let total = 0;
while (batches < MAX_BATCHES) {
  const res = await stream.recv();
  if (res === null) break;
  const n = res.data?.logs?.length ?? 0;
  const decoded = await decoder.decodeLogs(res.data?.logs ?? []);
  for (const event of decoded) {
    if (!event) continue;
    const from = event.indexed[0]?.val?.toString().toLowerCase();
    const to = event.indexed[1]?.val?.toString().toLowerCase();
    if (normalizedWallets.has(from)) activity[from].out += 1;
    if (normalizedWallets.has(to)) activity[to].in += 1;
  }
  total += n;
  batches += 1;
  console.log(`batch=${batches} nextBlock=${res.nextBlock} logs=${n} total=${total}`);
}
await stream.close?.();
console.table(
  Object.entries(activity).map(([wallet, counts]) => ({ wallet, ...counts }))
);
console.log(`Done. total=${total}`);
