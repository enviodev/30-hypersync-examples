import { HypersyncClient } from "@envio-dev/hypersync-client";

const apiToken = process.env.ENVIO_API_TOKEN;
if (!apiToken) {
  console.error("Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens");
  process.exit(1);
}

const MAX_HEIGHT_EVENTS = Number(process.env.MAX_HEIGHT_EVENTS || 3);

const client = new HypersyncClient({
  url: process.env.HYPERSYNC_URL || "https://eth.hypersync.xyz",
  apiToken,
});

const heightStream = await client.streamHeight();
let seen = 0;

try {
  while (seen < MAX_HEIGHT_EVENTS) {
    const event = await heightStream.recv();
    if (event === null) break;
    switch (event.type) {
      case "Height":
        console.log(`Height: ${event.height}`);
        seen += 1;
        break;
      case "Connected":
        console.log("Connected");
        break;
      case "Reconnecting":
        console.log(`Reconnecting in ${event.delayMillis}ms: ${event.errorMsg}`);
        break;
      default:
        break;
    }
  }
} finally {
  await heightStream.close();
  console.log("Done");
}
