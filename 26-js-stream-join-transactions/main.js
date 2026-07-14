import { HypersyncClient, JoinMode } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const TRANSFER =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const baseQuery = {
  fromBlock: Math.max(0, safeHeight - 200),
  toBlock: safeHeight,
  logs: [{ address: [USDC], topics: [[TRANSFER]] }],
  fieldSelection: {
    log: ["Address", "Topic0", "TransactionHash", "BlockNumber"],
    transaction: ["Hash", "From", "To", "Value"],
  },
};

const withoutJoin = await client.collect(
  { ...baseQuery, joinMode: JoinMode.JoinNothing },
  {}
);
const withTransactions = await client.collect(
  { ...baseQuery, joinMode: JoinMode.Default },
  {}
);

console.table([
  {
    mode: "JoinNothing",
    logs: withoutJoin.data.logs.length,
    transactions: withoutJoin.data.transactions.length,
  },
  {
    mode: "Default (logs → transactions)",
    logs: withTransactions.data.logs.length,
    transactions: withTransactions.data.transactions.length,
  },
]);

const transactionsByHash = new Map(
  withTransactions.data.transactions.map((tx) => [tx.hash, tx])
);
console.table(
  withTransactions.data.logs.slice(0, 5).map((log) => {
    const tx = transactionsByHash.get(log.transactionHash);
    return {
      block: log.blockNumber,
      transactionHash: log.transactionHash,
      from: tx?.from,
      to: tx?.to,
      nativeValueWei: tx?.value?.toString(),
    };
  })
);
