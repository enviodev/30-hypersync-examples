import hypersync
import asyncio

# This simple script returns all logs from a contract within a block range


async def main():
    # 35+ chains supports by hypersync see: https://docs.envio.dev/docs/overview-hypersync
    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(url="https://eth.hypersync.xyz"))

    eigenlayer_slasher = "0xD92145c07f8Ed1D392c1B88017934E301CC1c3Cd"

    query = hypersync.preset_query_logs(eigenlayer_slasher, 0, 20_000_000)

    print("Running the query...")

    res = await client.get(query)

    print(f"Query returned {len(res.data.logs)} logs from contract {
          eigenlayer_slasher}; reached block {res.next_block}")

asyncio.run(main())
