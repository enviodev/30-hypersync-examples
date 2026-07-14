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

    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(
            url=os.environ.get("HYPERSYNC_URL", "https://eth.hypersync.xyz"),
            bearer_token=api_token,
        )
    )

    height = await client.get_height()
    safe_height = max(0, height - int(os.environ.get("CONFIRMATIONS", "12")))
    from_block = max(0, safe_height - int(os.environ.get("BLOCK_WINDOW", "5000")))
    query = hypersync.preset_query_blocks_and_transactions(from_block, safe_height)

    # Tune streaming — keep values modest for a local demo
    config = hypersync.StreamConfig(
        concurrency=4,
        batch_size=20,
        max_batch_size=50,
    )

    default_result = await benchmark(client, query, hypersync.StreamConfig())
    tuned_result = await benchmark(client, query, config)

    print("\nconfiguration   seconds   blocks   txs   blocks/sec   txs/sec")
    for name, result in (("default", default_result), ("tuned", tuned_result)):
        seconds, blocks, txs = result
        print(
            f"{name:<15} {seconds:>7.2f} {blocks:>8} {txs:>7} "
            f"{blocks / seconds:>12.1f} {txs / seconds:>9.1f}"
        )


async def benchmark(client, query, config):
    receiver = await client.stream(query, config)
    started = time.perf_counter()
    blocks = 0
    txs = 0
    while True:
        res = await receiver.recv()
        if res is None:
            break
        b = len(res.data.blocks) if res.data and res.data.blocks else 0
        t = len(res.data.transactions) if res.data and res.data.transactions else 0
        blocks += b
        txs += t
    return time.perf_counter() - started, blocks, txs


asyncio.run(main())
