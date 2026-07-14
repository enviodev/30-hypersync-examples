import {
  Decoder,
  HypersyncClient,
  JoinMode,
  Query,
} from "@envio-dev/hypersync-client";
import {
  erc20InThreshold,
  erc20OutThreshold,
  hyperSyncEndpoint,
  targetAddress,
} from "./config";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error(
    "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
  );
  process.exit(1);
}
const token: string = apiToken;

// Convert an address to its zero-padded indexed-topic representation.
function addressToTopic(address: string): string {
  return "0x000000000000000000000000" + address.slice(2, address.length);
}

const transferEventSigHash =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function main() {
  console.time("Script Execution Time");

  // Create a client using the configured HyperSync endpoint.
  const client = new HypersyncClient({
    url: hyperSyncEndpoint,
    apiToken: token,
  });
  const height = await client.getHeight();
  const confirmations = Number(process.env.CONFIRMATIONS || 12);

  // The query to run
  const query: Query = {
    // Stop at a confirmed snapshot so the statement is reproducible.
    fromBlock: Number(process.env.FROM_BLOCK || 0),
    toBlock: Math.max(0, height - confirmations),
    joinMode: JoinMode.JoinNothing,
    // Match wallet transfers directly; JoinNothing avoids pulling unrelated joined rows.
    logs: [
      {
        // We want All ERC20 transfers coming to any of our addresses
        topics: [
          [transferEventSigHash],
          [],
          [addressToTopic(targetAddress)],
          [],
        ],
      },
      {
        // We want All ERC20 transfers going from any of our addresses
        topics: [
          [transferEventSigHash],
          [addressToTopic(targetAddress)],
          [],
          [],
        ],
      },
    ],
    transactions: [{ from: [targetAddress] }, { to: [targetAddress] }],
    // Select the fields we are interested in (PascalCase enum names required by client 1.x)
    fieldSelection: {
      transaction: ["Hash", "BlockNumber", "From", "To", "Value"],
      log: ["Data", "Address", "Topic0", "Topic1", "Topic2"],
    },
  };

  console.log("Running the query...");

  const receiver = await client.stream(query, {
    concurrency: 16,
    maxBatchSize: 10000,
  });

  const decoder = Decoder.fromSignatures([
    "Transfer(address indexed from, address indexed to, uint amount)",
  ]);

  let total_wei_volume_in = BigInt(0);
  let total_wei_volume_out = BigInt(0);
  let transaction_count_in = 0;
  let transaction_count_out = 0;

  const erc20_volumes: {
    [address: string]: {
      in: bigint;
      out: bigint;
      count_in: number;
      count_out: number;
      net: bigint;
    };
  } = {};

  while (true) {
    const res = await receiver.recv();
    if (res === null) {
      break;
    }

    console.log(`scanned up to block: ${res.nextBlock}`);

    // Decode the log on a background thread so we don't block the event loop.
    // Can also use decoder.decodeLogsSync if it is more convenient.
    const decodedLogs = await decoder.decodeLogs(res.data.logs);

    for (const tx of res.data.transactions) {
      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();
      const value = tx.value == null ? 0n : BigInt(tx.value);
      if (value === 0n) continue;
      if (from === targetAddress) {
        total_wei_volume_out += value;
        transaction_count_out += 1;
      }
      if (to === targetAddress) {
        total_wei_volume_in += value;
        transaction_count_in += 1;
      }
    }

    for (let i = 0; i < decodedLogs.length; i++) {
      const log = decodedLogs[i];
      const rawLogData = res.data.logs[i];

      // skip invalid logs
      if (
        log == undefined ||
        log.indexed.length < 2 ||
        log.body.length < 1 ||
        rawLogData == undefined ||
        rawLogData.address == undefined
      ) {
        continue;
      }

      const to = (log.indexed[1].val as string).toLowerCase();
      const value = log.body[0].val as bigint;
      const erc20Address = rawLogData.address.toLowerCase();
      const from = (log.indexed[0].val as string).toLowerCase();

      if (!erc20_volumes[erc20Address]) {
        erc20_volumes[erc20Address] = {
          in: BigInt(0),
          out: BigInt(0),
          count_in: 0,
          count_out: 0,
          net: BigInt(0),
        };
      }

      if (from === targetAddress) {
        erc20_volumes[erc20Address].out += value;
        erc20_volumes[erc20Address].net -= value;
        erc20_volumes[erc20Address].count_out++;
      }
      if (to === targetAddress) {
        erc20_volumes[erc20Address].in += value;
        erc20_volumes[erc20Address].net += value;
        erc20_volumes[erc20Address].count_in++;
      }
    }
  }

  console.timeEnd("Script Execution Time");

  console.log("Native asset activity:");
  console.log(
    `  in=${transaction_count_in} (${formatEther(total_wei_volume_in)} ETH) ` +
      `out=${transaction_count_out} (${formatEther(total_wei_volume_out)} ETH)`
  );

  console.log("ERC-20 activity (raw token units; decimals differ by token):");

  for (const [address, volume] of Object.entries(erc20_volumes)) {
    if (
      volume.count_in >= erc20InThreshold ||
      volume.count_out >= erc20OutThreshold
    ) {
      console.log(`Token: ${address}`);
      console.log(
        `  Total # of ERC20 transactions - in: ${volume.count_in} out: ${volume.count_out}`
      );
      console.log(`  Net ERC20 balance: ${volume.net}`); // Display the net balance

      console.log(`  Total ERC20 volume in: ${volume.in}`);
      console.log(`  Total ERC20 volume out: ${volume.out}`);
    }
  }
}

function formatEther(value: bigint): string {
  const whole = value / 10n ** 18n;
  const fraction = (value % 10n ** 18n).toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${fraction}`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
