import {
  DataType,
  HexOutput,
  HypersyncClient,
} from "@envio-dev/hypersync-client";

async function main() {

  let bearerToken = process.env.HYPERSYNC_BEARER_TOKEN;
  if (!bearerToken) {
    console.warn("Please create a token at https://envio.dev/app/api-tokens and set the HYPERSYNC_BEARER_TOKEN environment variable. API tokens will improve the reliability of the service, and in future they may become compulsory.")
    bearerToken = "hypersync-examples-repo" // This isn't a real token.
  }
  // Create hypersync client using the mainnet hypersync endpoint
  const client = HypersyncClient.new({
    url: "https://eth.hypersync.xyz",
    bearerToken: bearerToken,
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
        "block_number",
        "log_index",
        "transaction_index",
        "transaction_hash",
        "data",
        "address",
        "topic0",
        "topic1",
        "topic2",
        "topic3",
      ],
    },
  };

  console.log(
    "Writing to parquet... This might take some time depending on connection speed"
  );

  const startWrite = performance.now(); // Start measuring collectParquet execution time
  await client.collectParquet("data", query, {
    hexOutput: HexOutput.Prefixed,
    columnMapping: {
      decodedLog: {
        value: DataType.Float64,
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
