import {
  DataType,
  HexOutput,
  HypersyncClient,
  presetQueryBlocksAndTransactions,
} from "@envio-dev/hypersync-client";

async function main() {
  // Create hypersync client using the mainnet hypersync endpoint
  const client = HypersyncClient.new({
    url: "https://arbitrum.hypersync.xyz",
  });

  const height = await client.getHeight(); // Await the getHeight call

  const query = {
    fromBlock: height - 100000,
    logs: [{}],
    fieldSelection: {
      // block: ["number", "timestamp"],
      transaction: ["block_number"],
    },
  };

  console.log("starting");

  const startWrite = performance.now(); // Start measuring collectParquet execution time
  await client.collectParquet("data", query, {
    hexOutput: HexOutput.Prefixed,
  });
  const endWrite = performance.now(); // End measuring collectParquet execution time
  console.log(
    `Finished writing parquet. Time taken: ${(endWrite - startWrite).toFixed(
      2
    )} ms`
  );
}

main();
