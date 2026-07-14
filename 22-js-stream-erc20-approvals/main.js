import { HypersyncClient, Decoder } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const MAX_EVENTS = Number(process.env.MAX_EVENTS || 15);
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const APPROVAL =
  "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";

const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});
const decoder = Decoder.fromSignatures([
  "Approval(address indexed owner, address indexed spender, uint256 value)",
]);

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - 2_000),
  toBlock: safeHeight,
  logs: [{ address: [USDT], topics: [[APPROVAL]] }],
  fieldSelection: {
    log: ["Address", "Data", "Topic0", "Topic1", "Topic2", "BlockNumber"],
  },
};

const stream = await client.stream(query, {});
let count = 0;
while (count < MAX_EVENTS) {
  const res = await stream.recv();
  if (res === null) break;
  if (res.data?.logs?.length) {
    const decoded = await decoder.decodeLogs(res.data.logs);
    for (const d of decoded) {
      if (!d || count >= MAX_EVENTS) continue;
      console.log(
        `Approval owner=${d.indexed[0]?.val} spender=${d.indexed[1]?.val} ` +
          `usdt=${formatUnits(BigInt(d.body[0]?.val?.toString() ?? "0"), 6)}`
      );
      count += 1;
    }
  }
}
await stream.close?.();
console.log(`Done. approvals=${count}`);

function formatUnits(value, decimals) {
  const scale = 10n ** BigInt(decimals);
  return `${value / scale}.${(value % scale).toString().padStart(decimals, "0")}`;
}
