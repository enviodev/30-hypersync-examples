import { HypersyncClient } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const MAX_RESULTS = Number(process.env.MAX_RESULTS || 10);
const THRESHOLD_WEI = 10n ** 15n; // 0.001 ETH

const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth-traces.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - 50),
  toBlock: safeHeight,
  traces: [
    {
      // call traces only; filter value client-side for clarity
      callType: ["call"],
    },
  ],
  fieldSelection: {
    trace: [
      "From",
      "To",
      "Value",
      "CallType",
      "BlockNumber",
      "TransactionHash",
      "TraceAddress",
      "Error",
    ],
  },
};

const stream = await client.stream(query, {});
const results = [];

outer: while (results.length < MAX_RESULTS) {
  const res = await stream.recv();
  if (res === null) break;
  for (const t of res.data?.traces ?? []) {
    if (t.value == null) continue;
    const value = BigInt(t.value);
    if (value <= THRESHOLD_WEI) continue;
    results.push({
      from: t.from,
      to: t.to,
      valueWei: value.toString(),
      valueEth: formatEther(value),
      tx: t.transactionHash,
      block: t.blockNumber,
      depth: t.traceAddress?.length ?? 0,
      error: t.error ?? null,
    });
    if (results.length >= MAX_RESULTS) break outer;
  }
}

await stream.close?.();
console.table(results);
console.log(`Done. found=${results.length}`);

function formatEther(value) {
  const scale = 10n ** 18n;
  return `${value / scale}.${(value % scale)
    .toString()
    .padStart(18, "0")
    .slice(0, 6)}`;
}
