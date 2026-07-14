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
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCKS || 20)),
  toBlock: safeHeight,
  includeAllBlocks: true,
  // An empty selection object means “all transactions in this block range.”
  transactions: [{}],
  fieldSelection: {
    block: ["Number", "Timestamp", "GasUsed", "BaseFeePerGas"],
    transaction: ["Hash", "BlockNumber", "From", "GasUsed", "EffectiveGasPrice"],
  },
};

const res = await client.collect(query, {});
const transactionCounts = new Map();
for (const tx of res.data.transactions) {
  transactionCounts.set(
    tx.blockNumber,
    (transactionCounts.get(tx.blockNumber) || 0) + 1
  );
}

console.table(
  res.data.blocks.map((block) => ({
    block: block.number,
    time: new Date(block.timestamp * 1000).toISOString(),
    transactions: transactionCounts.get(block.number) || 0,
    gasUsed: block.gasUsed?.toString(),
    baseFeeGwei:
      block.baseFeePerGas == null
        ? null
        : (Number(block.baseFeePerGas) / 1e9).toFixed(3),
  }))
);
console.log(`Done. blocks=${res.data.blocks.length} txs=${res.data.transactions.length}`);
