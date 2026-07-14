import {
  HypersyncClient,
  presetQueryLogsOfEvent,
} from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const client = new HypersyncClient({
  url: "https://eth.hypersync.xyz",
  apiToken,
});

const usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const transfer =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const query = presetQueryLogsOfEvent(usdt, transfer, 17_000_000, 17_000_050);
const res = await client.get(query);
console.log(
  `Found ${res.data.logs.length} Transfer logs; nextBlock=${res.nextBlock}`
);
