import { keccak256, toHex } from "viem";
import { Decoder, HypersyncClient } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error(
    "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
  );
  process.exit(1);
}

const ZKSYNC_LEGACY = "0xabea9132b05a70803a4e85094fd0e1800777fbef";
const event_signatures = ["BlockVerification(uint32)", "BlockCommit(uint32)"];
const decoder_signatures = [
  "BlockVerification(uint32 indexed blockNumber)",
  "BlockCommit(uint32 indexed blockNumber)",
];

const topic0_list = event_signatures.map((sig) => keccak256(toHex(sig)));

const [verificationTopic, commitTopic] = topic0_list;
const client = new HypersyncClient({
  // The legacy zkSync rollup contract emitted these events on Ethereum L1.
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const height = await client.getHeight();
const safeHeight = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
const query = {
  // This compact historical window contains both commit and verification events.
  fromBlock: Number(process.env.FROM_BLOCK || 10_270_000),
  toBlock: Math.min(Number(process.env.TO_BLOCK || 10_300_000), safeHeight),
  logs: [
    {
      address: [ZKSYNC_LEGACY],
      topics: [topic0_list],
    },
  ],
  fieldSelection: {
    log: [
      "BlockNumber",
      "TransactionHash",
      "Address",
      "Topic0",
      "Topic1",
      "Data",
    ],
  },
};

const main = async () => {
  const decoder = Decoder.fromSignatures(decoder_signatures);
  const commits = new Map();
  const latencies = [];
  const startTime = performance.now();
  const stream = await client.stream(query, { concurrency: 8 });
  try {
    while (true) {
      const res = await stream.recv();
      if (res === null) break;
      const decoded = await decoder.decodeLogs(res.data.logs);
      for (let i = 0; i < res.data.logs.length; i++) {
        const log = res.data.logs[i];
        const event = decoded[i];
        const blockNumber = Number(log?.blockNumber);
        const zkBlock = event?.indexed[0]?.val?.toString();
        if (!log || !event || !zkBlock || !Number.isFinite(blockNumber)) continue;

        const topic0 = log.topics?.[0];
        if (topic0 === commitTopic) {
          commits.set(zkBlock, blockNumber);
        } else if (topic0 === verificationTopic && commits.has(zkBlock)) {
          latencies.push(blockNumber - commits.get(zkBlock));
        }
      }
      console.log(
        `nextBlock=${res.nextBlock} commits=${commits.size} paired=${latencies.length}`
      );
    }
  } finally {
    await stream.close();
  }

  const average = latencies.length
    ? latencies.reduce((sum, value) => sum + value, 0) / latencies.length
    : 0;
  console.log(
    `Done in ${((performance.now() - startTime) / 1000).toFixed(2)}s. ` +
      `paired=${latencies.length} average_l1_blocks_to_verify=${average.toFixed(2)}`
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
