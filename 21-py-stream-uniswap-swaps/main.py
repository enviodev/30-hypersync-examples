import asyncio
import os

import hypersync
from hypersync import LogField, LogSelection


SWAP_TOPIC = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"


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
    from_block = max(0, height - 1_000)

    query = hypersync.Query(
        from_block=from_block,
        logs=[LogSelection(topics=[[SWAP_TOPIC]])],
        field_selection=hypersync.FieldSelection(
            log=[LogField.ADDRESS, LogField.TOPIC0, LogField.DATA, LogField.BLOCK_NUMBER]
        ),
    )

    receiver = await client.stream(query, hypersync.StreamConfig())
    total = 0
    batches = 0
    while batches < max_batches:
        res = await receiver.recv()
        if res is None:
            break
        n = len(res.data.logs) if res.data and res.data.logs else 0
        total += n
        batches += 1
        print(f"batch={batches} next_block={res.next_block} swaps={n} total={total}")

    print(f"Done. total_swaps={total}")


asyncio.run(main())
