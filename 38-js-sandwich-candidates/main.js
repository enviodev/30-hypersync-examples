import { Decoder, HypersyncClient, JoinMode } from "@envio-dev/hypersync-client";
import { keccak256, toHex } from "viem";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const SIGNATURE =
  "Swap(address indexed sender,uint256 amount0In,uint256 amount1In,uint256 amount0Out,uint256 amount1Out,address indexed to)";
const TOPIC = keccak256(toHex("Swap(address,uint256,uint256,uint256,uint256,address)"));
const poolAddress = process.env.POOL_ADDRESS;
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 500)),
  toBlock: safeHeight,
  joinMode: JoinMode.Default,
  logs: [{ ...(poolAddress ? { address: [poolAddress] } : {}), topics: [[TOPIC]] }],
  fieldSelection: {
    log: [
      "Address",
      "BlockNumber",
      "LogIndex",
      "TransactionHash",
      "Topic0",
      "Topic1",
      "Topic2",
      "Data",
    ],
    transaction: ["Hash", "From"],
  },
};

const result = await client.collect(query, {});
const decoded = await Decoder.fromSignatures([SIGNATURE]).decodeLogs(result.data.logs);
const transactionFrom = new Map(
  result.data.transactions.map((transaction) => [transaction.hash, transaction.from?.toLowerCase()])
);
const swaps = decoded.flatMap((event, index) => {
  if (!event) return [];
  const log = result.data.logs[index];
  const amounts = event.body.slice(0, 4).map((item) => BigInt(item.val?.toString() || "0"));
  return [{
    block: log.blockNumber,
    logIndex: log.logIndex,
    pool: log.address,
    transaction: log.transactionHash,
    from: transactionFrom.get(log.transactionHash),
    direction: direction(...amounts),
  }];
}).filter((swap) => swap.direction);

swaps.sort((left, right) => left.block - right.block || left.logIndex - right.logIndex);
const candidates = [];
for (let index = 0; index + 2 < swaps.length; index++) {
  const [front, victim, back] = swaps.slice(index, index + 3);
  if (
    front.block === victim.block &&
    victim.block === back.block &&
    front.pool === victim.pool &&
    victim.pool === back.pool &&
    front.from &&
    front.from === back.from &&
    front.from !== victim.from &&
    front.direction === victim.direction &&
    front.direction !== back.direction &&
    new Set([front.transaction, victim.transaction, back.transaction]).size === 3
  ) {
    candidates.push({
      block: front.block,
      pool: front.pool,
      attacker: front.from,
      victim: victim.from,
      frontRun: front.transaction,
      victimTx: victim.transaction,
      backRun: back.transaction,
    });
  }
}

console.table(candidates.slice(0, Number(process.env.MAX_RESULTS || 10)));
console.log(`Done. swaps=${swaps.length} heuristic_candidates=${candidates.length}`);

function direction(amount0In, amount1In, amount0Out, amount1Out) {
  if (amount0In > 0n && amount1Out > 0n) return "token0→token1";
  if (amount1In > 0n && amount0Out > 0n) return "token1→token0";
  return null;
}
