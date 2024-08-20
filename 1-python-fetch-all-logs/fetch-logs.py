import os
import hypersync
import asyncio

# This simple script returns all logs from a contract within a block range
async def main():
    # 35+ chains supports by hypersync see: https://docs.envio.dev/docs/overview-hypersync
    bearer_token = os.environ.get("HYPERSYNC_BEARER_TOKEN")
    if not bearer_token:
        print("\033[93mPlease create a token at https://envio.dev/app/api-tokens and set the HYPERSYNC_BEARER_TOKEN environment variable. API tokens will improve the reliability of the service, and in future they may become compulsory.\033[0m")
        bearer_token = "hypersync-examples-repo" # This isn't a real token.

    client = hypersync.HypersyncClient(hypersync.ClientConfig(url="https://eth.hypersync.xyz", bearer_token=bearer_token))

    eigenlayer_slasher = "0xD92145c07f8Ed1D392c1B88017934E301CC1c3Cd"

    query = hypersync.preset_query_logs(eigenlayer_slasher, 0, 19_670_000)

    print("Running the query...")

    res = await client.get(query)

    print(f"Query returned {len(res.data.logs)} logs from contract {eigenlayer_slasher}; reached block {res.next_block}")

asyncio.run(main())
