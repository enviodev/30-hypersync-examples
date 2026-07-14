import { HypersyncClient } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});
const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 25)),
  toBlock: safeHeight,
  transactions: [{}],
  fieldSelection: {
    transaction: [
      "Hash",
      "BlockNumber",
      "From",
      "To",
      "Status",
      "GasUsed",
      "Input",
    ],
  },
};

const result = await client.collect(query, {});
const failed = result.data.transactions.filter((transaction) => isFailed(transaction.status));
const hotspots = new Map();
for (const transaction of failed) {
  const target = transaction.to || "<contract creation>";
  const selector = transaction.input?.length >= 10 ? transaction.input.slice(0, 10) : "0x";
  const key = `${target}|${selector}`;
  const current = hotspots.get(key) || { target, selector, failures: 0, gasUsed: 0n };
  current.failures += 1;
  current.gasUsed += BigInt(transaction.gasUsed || 0);
  hotspots.set(key, current);
}

const rows = [...hotspots.values()]
  .sort((left, right) => right.failures - left.failures)
  .slice(0, Number(process.env.MAX_RESULTS || 15))
  .map((row) => ({ ...row, gasUsed: row.gasUsed.toString() }));

console.table(rows);
console.log(
  `Done. transactions=${result.data.transactions.length} failed=${failed.length} ` +
    `failure_rate=${result.data.transactions.length ? (100 * failed.length / result.data.transactions.length).toFixed(2) : "0.00"}%`
);

function isFailed(status) {
  if (status == null) return false;
  return BigInt(status) === 0n;
}
