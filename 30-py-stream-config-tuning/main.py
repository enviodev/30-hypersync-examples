import asyncio
import os
import time

import hypersync


async def main():
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens"
        )

    max_batches = int(os.environ.get("MAX_BATCHES", "5"))
    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(url="https://eth.hypersync.xyz", bearer_token=api_token)
    )

    height = await client.get_height()
    from_block = max(0, height - 100)
    query = hypersync.preset_query_blocks_and_transactions(from_block, height)

    # Tune streaming — keep values modest for a local demo
    config = hypersync.StreamConfig(
        concurrency=4,
        batch_size=20,
        max_batch_size=50,
    )

    receiver = await client.stream(query, config)
    start = time.time()
    batches = 0
    blocks = 0
    txs = 0

    while batches < max_batches:
        res = await receiver.recv()
        if res is None:
            break
        b = len(res.data.blocks) if res.data and res.data.blocks else 0
        t = len(res.data.transactions) if res.data and res.data.transactions else 0
        blocks += b
        txs += t
        batches += 1
        print(
            f"batch={batches} next_block={res.next_block} blocks={b} txs={t} "
            f"elapsed={time.time() - start:.2f}s"
        )

    print(f"Done. blocks={blocks} txs={txs}")


asyncio.run(main())
