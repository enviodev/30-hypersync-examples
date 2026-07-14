import asyncio
import os
import time

import hypersync
from hypersync import LogField, LogSelection


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

    usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    transfer = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

    height = await client.get_height()
    from_block = max(0, height - 2_000)

    query = hypersync.Query(
        from_block=from_block,
        logs=[LogSelection(address=[usdt], topics=[[transfer]])],
        field_selection=hypersync.FieldSelection(
            log=[LogField.ADDRESS, LogField.TOPIC0, LogField.DATA, LogField.BLOCK_NUMBER]
        ),
    )

    receiver = await client.stream(query, hypersync.StreamConfig())
    start = time.time()
    total = 0
    batches = 0

    while batches < max_batches:
        res = await receiver.recv()
        if res is None:
            break
        n = len(res.data.logs) if res.data and res.data.logs else 0
        total += n
        batches += 1
        elapsed = time.time() - start
        print(
            f"batch={batches} next_block={res.next_block} logs_batch={n} "
            f"total={total} elapsed={elapsed:.2f}s"
        )

    print(f"Done. total_logs={total}")


asyncio.run(main())
