import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";
import { keccak256, toHex } from "viem";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const OPTIMISM_PORTAL = "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed";
const SIGNATURE =
  "TransactionDeposited(address indexed from,address indexed to,uint256 indexed version,bytes opaqueData)";
const TOPIC = keccak256(toHex("TransactionDeposited(address,address,uint256,bytes)"));
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 10_000)),
  toBlock: safeHeight,
  logs: [{ address: [OPTIMISM_PORTAL], topics: [[TOPIC]] }],
  fieldSelection: {
    log: [
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
const decoded = await Decoder.fromSignatures([SIGNATURE]).decodeLogs(result.data.logs);
const deposits = decoded.flatMap((event, index) => {
  if (!event) return [];
  const opaqueData = event.body[0]?.val;
  const opaqueBytes = typeof opaqueData === "string"
    ? Math.max(0, (opaqueData.length - 2) / 2)
    : opaqueData?.length;
  return [{
    block: result.data.logs[index].blockNumber,
    from: event.indexed[0]?.val?.toString(),
    to: event.indexed[1]?.val?.toString(),
    version: event.indexed[2]?.val?.toString(),
    opaqueBytes,
    transaction: result.data.logs[index].transactionHash,
  }];
});

console.table(deposits.slice(0, Number(process.env.MAX_RESULTS || 15)));
console.log(`Done. op_deposits=${deposits.length}`);
