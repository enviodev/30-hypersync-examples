import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";
import { keccak256, toHex } from "viem";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const SIGNATURE =
  "NameRegistered(string name,bytes32 indexed label,address indexed owner,uint256 cost,uint256 expires)";
const TOPIC = keccak256(toHex("NameRegistered(string,bytes32,address,uint256,uint256)"));
const controllerAddress = process.env.CONTROLLER_ADDRESS;
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 100_000)),
  toBlock: safeHeight,
  logs: [{
    ...(controllerAddress ? { address: [controllerAddress] } : {}),
    topics: [[TOPIC]],
  }],
  fieldSelection: {
    log: [
      "Address",
      "BlockNumber",
      "TransactionHash",
      "Topic0",
      "Topic1",
      "Topic2",
      "Data",
    ],
  },
};

const result = await client.collect(query, {});
const decoded = await Decoder.fromSignatures([SIGNATURE]).decodeLogs(result.data.logs);
const registrations = decoded.flatMap((event, index) => event ? [{
  block: result.data.logs[index].blockNumber,
  controller: result.data.logs[index].address,
  name: `${event.body[0]?.val}.eth`,
  owner: event.indexed[1]?.val?.toString(),
  costEth: formatEther(BigInt(event.body[1]?.val?.toString() || "0")),
  expires: new Date(Number(event.body[2]?.val || 0) * 1_000).toISOString(),
  transaction: result.data.logs[index].transactionHash,
}] : []);

console.table(registrations.slice(0, Number(process.env.MAX_RESULTS || 15)));
console.log(`Done. registrations=${registrations.length}`);

function formatEther(value) {
  const whole = value / 10n ** 18n;
  const fraction = (value % 10n ** 18n).toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${fraction}`;
}
