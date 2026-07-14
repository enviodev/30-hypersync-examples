import {
  HypersyncClient,
  BlockField,
  TransactionField,
} from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error(
    "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
  );
  process.exit(1);
}

// Replace with the wallet address you want to check
const TARGET_ADDRESS = (
  process.argv[2] ||
  process.env.WALLET_ADDRESS ||
  "0xBEa9f7FD27f4EE20066F18DEF0bc586eC221055A"
).toLowerCase();
if (!/^0x[a-f0-9]{40}$/.test(TARGET_ADDRESS)) {
  throw new Error(`Invalid wallet address: ${TARGET_ADDRESS}`);
}
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY || 3));
if (!Number.isFinite(CONCURRENCY)) {
  throw new Error("CONCURRENCY must be a positive number");
}

// Top chains to query
const CHAINS = [
  { name: "eth", url: "https://eth.hypersync.xyz", displayName: "Ethereum" },
  {
    name: "optimism",
    url: "https://optimism.hypersync.xyz",
    displayName: "Optimism",
  },
  { name: "base", url: "https://base.hypersync.xyz", displayName: "Base" },
  {
    name: "arbitrum",
    url: "https://arbitrum.hypersync.xyz",
    displayName: "Arbitrum",
  },
  {
    name: "polygon",
    url: "https://polygon.hypersync.xyz",
    displayName: "Polygon",
  },
  { name: "xdc", url: "https://xdc.hypersync.xyz", displayName: "XDC" },
  {
    name: "gnosis",
    url: "https://gnosis.hypersync.xyz",
    displayName: "Gnosis",
  },
  {
    name: "avalanche",
    url: "https://avalanche.hypersync.xyz",
    displayName: "Avalanche",
  },
  {
    name: "bsc",
    url: "https://bsc.hypersync.xyz",
    displayName: "Binance Smart Chain",
  },
  {
    name: "zksync",
    url: "https://zksync.hypersync.xyz",
    displayName: "zkSync",
  },
];

// Function to query a specific chain
async function queryChain(chain) {
  try {
    console.log(`Querying ${chain.displayName}...`);

    // Initialize client for this chain
    const client = new HypersyncClient({
      url: chain.url,
      apiToken: apiToken,
    });

    const height = await client.getHeight();
    const toBlock = Math.max(0, height - Number(process.env.CONFIRMATIONS || 12));
    const query = {
      fromBlock: 0,
      toBlock,
      transactions: [{ from: [TARGET_ADDRESS] }, { to: [TARGET_ADDRESS] }],
      fieldSelection: {
        block: [BlockField.Number, BlockField.Timestamp],
        transaction: [TransactionField.Hash],
      },
      maxNumTransactions: 1,
    };

    // Start streaming blocks
    const stream = await client.stream(query, {});
    let res;
    try {
      // We only need the first result.
      res = await stream.recv();
    } finally {
      await stream.close();
    }

    // Handle no results
    if (
      res === null ||
      !res.data ||
      !res.data.transactions ||
      res.data.transactions.length === 0
    ) {
      return {
        chain: chain.displayName,
        found: false,
      };
    }

    // Get transaction and block data
    const firstTransaction = res.data.transactions[0];
    const block = res.data.blocks[0];

    return {
      chain: chain.displayName,
      found: true,
      blockNumber: block.number,
      timestamp: block.timestamp,
      formattedTime: new Date(block.timestamp * 1000).toISOString(),
      hash: firstTransaction.hash,
    };
  } catch (error) {
    console.error(`Error querying ${chain.displayName}:`, error.message);
    return {
      chain: chain.displayName,
      found: false,
      error: error.message,
    };
  }
}

const main = async () => {
  console.log(
    `Looking for the first transaction for address: ${TARGET_ADDRESS} across multiple chains\n`
  );

  try {
    const results = await mapWithConcurrency(CHAINS, CONCURRENCY, queryChain);

    // Display results
    console.log("\n===== Results =====\n");

    let foundOnAnyChain = false;

    for (const result of results) {
      if (result.found) {
        foundOnAnyChain = true;
        console.log(`\n[${result.chain}]`);
        console.log(`Block Number: ${result.blockNumber}`);
        console.log(`Timestamp: ${result.timestamp} (${result.formattedTime})`);
        console.log(`Transaction Hash: ${result.hash}`);
      } else {
        console.log(`\n[${result.chain}]`);
        console.log(
          result.error ? `Error: ${result.error}` : "No transactions found"
        );
      }
    }

    if (!foundOnAnyChain) {
      console.log("\nAddress not found on any of the queried chains.");
    }
  } catch (error) {
    console.error("Error executing queries:", error);
  }
};

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run())
  );
  return results;
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
