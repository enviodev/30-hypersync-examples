import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";
import { keccak256, toHex } from "viem";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const SIGNATURE = "Upgraded(address indexed implementation)";
const TOPIC = keccak256(toHex("Upgraded(address)"));
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 10_000)),
  toBlock: safeHeight,
  logs: [{ topics: [[TOPIC]] }],
  fieldSelection: {
    log: ["Address", "BlockNumber", "TransactionHash", "Topic0", "Topic1", "Data"],
  },
};

const result = await client.collect(query, {});
const decoded = await Decoder.fromSignatures([SIGNATURE]).decodeLogs(result.data.logs);
const upgrades = decoded.flatMap((event, index) => event ? [{
  block: result.data.logs[index].blockNumber,
  proxy: result.data.logs[index].address,
  implementation: event.indexed[0]?.val?.toString(),
  transaction: result.data.logs[index].transactionHash,
}] : []);

console.table(upgrades.slice(0, Number(process.env.MAX_RESULTS || 20)));
console.log(`Done. upgrades=${upgrades.length}`);
