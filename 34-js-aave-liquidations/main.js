import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";
import { keccak256, toHex } from "viem";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const AAVE_V3_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fa4E2";
const SIGNATURE =
  "LiquidationCall(address indexed collateralAsset,address indexed debtAsset,address indexed user,uint256 debtToCover,uint256 liquidatedCollateralAmount,address liquidator,bool receiveAToken)";
const TOPIC = keccak256(
  toHex("LiquidationCall(address,address,address,uint256,uint256,address,bool)")
);
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 200_000)),
  toBlock: safeHeight,
  logs: [{ address: [AAVE_V3_POOL], topics: [[TOPIC]] }],
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
const liquidations = decoded.flatMap((event, index) => event ? [{
  block: result.data.logs[index].blockNumber,
  collateral: event.indexed[0]?.val?.toString(),
  debt: event.indexed[1]?.val?.toString(),
  user: event.indexed[2]?.val?.toString(),
  debtCoveredRaw: event.body[0]?.val?.toString(),
  collateralSeizedRaw: event.body[1]?.val?.toString(),
  liquidator: event.body[2]?.val?.toString(),
  receivedAToken: Boolean(event.body[3]?.val),
  transaction: result.data.logs[index].transactionHash,
}] : []);

console.table(liquidations.slice(0, Number(process.env.MAX_RESULTS || 10)));
console.log(`Done. liquidations=${liquidations.length}`);
