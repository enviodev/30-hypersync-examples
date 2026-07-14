import { HypersyncClient } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const MAX_RESULTS = Number(process.env.MAX_RESULTS || 10);
const THRESHOLD_WEI = 10n ** 15n; // 0.001 ETH

const client = new HypersyncClient({
  url: "https://eth-traces.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
let query = {
  fromBlock: Math.max(0, height - 50),
  traces: [
    {
      // call traces only; filter value client-side for clarity
      callType: ["call"],
    },
  ],
  fieldSelection: {
    trace: ["From", "To", "Value", "CallType", "BlockNumber", "TransactionHash"],
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
      tx: t.transactionHash,
      block: t.blockNumber,
    });
    if (results.length >= MAX_RESULTS) break outer;
  }
  query.fromBlock = res.nextBlock;
}

await stream.close?.();
console.table(results);
console.log(`Done. found=${results.length}`);
