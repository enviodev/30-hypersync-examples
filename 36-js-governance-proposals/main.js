import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";
import { keccak256, toHex } from "viem";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const SIGNATURE =
  "ProposalCreated(uint256 proposalId,address proposer,address[] targets,uint256[] values,string[] signatures,bytes[] calldatas,uint256 voteStart,uint256 voteEnd,string description)";
const TOPIC = keccak256(
  toHex("ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)")
);
const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  fromBlock: Math.max(0, safeHeight - Number(process.env.BLOCK_WINDOW || 1_000_000)),
  toBlock: safeHeight,
  logs: [{ topics: [[TOPIC]] }],
  fieldSelection: {
    log: ["Address", "BlockNumber", "TransactionHash", "Topic0", "Data"],
  },
};

const result = await client.collect(query, {});
const decoded = await Decoder.fromSignatures([SIGNATURE]).decodeLogs(result.data.logs);
const proposals = decoded.flatMap((event, index) => {
  if (!event) return [];
  const description = event.body[8]?.val?.toString() || "";
  return [{
    block: result.data.logs[index].blockNumber,
    governor: result.data.logs[index].address,
    proposalId: event.body[0]?.val?.toString(),
    proposer: event.body[1]?.val?.toString(),
    actions: event.body[2]?.val?.length,
    voteStart: event.body[6]?.val?.toString(),
    voteEnd: event.body[7]?.val?.toString(),
    description: description.replace(/\s+/g, " ").slice(0, 100),
  }];
});

console.table(proposals.slice(0, Number(process.env.MAX_RESULTS || 10)));
console.log(`Done. proposals=${proposals.length}`);
