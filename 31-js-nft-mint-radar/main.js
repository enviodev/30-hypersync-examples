import { HypersyncClient } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const TRANSFER =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ZERO_TOPIC = `0x${"0".repeat(64)}`;
const maxResults = Number(process.env.MAX_RESULTS || 15);
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 2_000)),
  toBlock: safeHeight,
  // ERC-721 mints are Transfer events whose `from` topic is the zero address.
  logs: [{ topics: [[TRANSFER], [ZERO_TOPIC]] }],
  fieldSelection: {
    log: [
      "Address",
      "BlockNumber",
      "TransactionHash",
      "Topic0",
      "Topic1",
      "Topic2",
      "Topic3",
      "Data",
    ],
  },
};

const result = await client.collect(query, {});
const mints = result.data.logs
  // ERC-721 token IDs are indexed in topic3. This excludes ERC-20 mint events.
  .filter((log) => log.topics?.[3] != null)
  .slice(0, maxResults)
  .map((log) => ({
    block: log.blockNumber,
    collection: log.address,
    recipient: topicToAddress(log.topics[2]),
    tokenId: BigInt(log.topics[3]).toString(),
    transaction: log.transactionHash,
  }));

console.table(mints);
console.log(
  `Done. erc721_mints=${result.data.logs.filter((log) => log.topics?.[3] != null).length} shown=${mints.length}`
);

function topicToAddress(topic) {
  return topic ? `0x${topic.slice(-40)}` : null;
}
