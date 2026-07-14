import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";
import { keccak256, toHex } from "viem";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const ENTRY_POINTS = [
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // v0.6
  "0x0000000071727De22E5E9d8BAf0edAc6f37da032", // v0.7
  "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108", // v0.8
  "0x433709009B8330FDa32311DF1C2AFA402eD8D009", // v0.9
];
const SIGNATURE =
  "UserOperationEvent(bytes32 indexed userOpHash,address indexed sender,address indexed paymaster,uint256 nonce,bool success,uint256 actualGasCost,uint256 actualGasUsed)";
const TOPIC = keccak256(
  toHex("UserOperationEvent(bytes32,address,address,uint256,bool,uint256,uint256)")
);
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 10_000)),
  toBlock: safeHeight,
  logs: [{ address: ENTRY_POINTS, topics: [[TOPIC]] }],
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
const decoded = await Decoder.fromSignatures([SIGNATURE]).decodeLogs(result.data.logs);
const operations = decoded.flatMap((event, index) => {
  if (!event) return [];
  const paymaster = String(event.indexed[2]?.val || ZERO_ADDRESS).toLowerCase();
  return [{
    block: result.data.logs[index].blockNumber,
    entryPoint: result.data.logs[index].address,
    sender: event.indexed[1]?.val?.toString(),
    success: Boolean(event.body[1]?.val),
    sponsored: paymaster !== ZERO_ADDRESS,
    gasUsed: event.body[3]?.val?.toString(),
    gasCostWei: event.body[2]?.val?.toString(),
    transaction: result.data.logs[index].transactionHash,
  }];
});

console.table(operations.slice(0, Number(process.env.MAX_RESULTS || 10)));
console.log(
  `Done. user_operations=${operations.length} successful=${operations.filter((op) => op.success).length} ` +
    `sponsored=${operations.filter((op) => op.sponsored).length}`
);
