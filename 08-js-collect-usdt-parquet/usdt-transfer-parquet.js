import {
  DataType,
  HexOutput,
  HypersyncClient,
} from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error(
    "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
  );
  process.exit(1);
}

async function main() {
  // Create hypersync client using the mainnet hypersync endpoint
  const client = new HypersyncClient({
    url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
    apiToken: apiToken,
  });

  const height = await client.getHeight(); // Await the getHeight call

  // Calculate the range of blocks
  const query = {
    fromBlock: height - 500000,
    logs: [
      {
        address: ["0xdAC17F958D2ee523a2206206994597C13D831ec7"],
        topics: [
          [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          ],
        ],
      },
    ],
    fieldSelection: {
      log: [
        "BlockNumber",
        "LogIndex",
        "TransactionIndex",
        "TransactionHash",
        "Data",
        "Address",
        "Topic0",
        "Topic1",
        "Topic2",
        "Topic3",
      ],
    },
  };

  console.log(
    "Writing to parquet... This might take some time depending on connection speed"
  );

  // Bound the range for a practical demo (full history can take a long time)
  query.toBlock = height - 499000;

  const startWrite = performance.now(); // Start measuring collectParquet execution time
  await client.collectParquet("data", query, {
    hexOutput: HexOutput.Prefixed,
    columnMapping: {
      decodedLog: {
        // USDT values are integers. Float64 can silently lose precision.
        value: DataType.UInt64,
      },
    },
    eventSignature:
      "Transfer(address indexed from, address indexed to, uint256 value)",
  });
  const endWrite = performance.now(); // End measuring collectParquet execution time
  console.log(
    `Finished writing parquet. Time taken: ${(endWrite - startWrite).toFixed(
      2
    )} ms`
  );
}

main();
