import asyncio
import os

import hypersync
from hypersync import LogField, LogSelection

# AnswerUpdated(int256,uint256,uint256)
ANSWER_UPDATED = (
    "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f"
)


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
    from_block = max(0, height - 5_000)

    # Match AnswerUpdated across all aggregators (proxies don't emit this event)
    query = hypersync.Query(
        from_block=from_block,
        logs=[LogSelection(topics=[[ANSWER_UPDATED]])],
        field_selection=hypersync.FieldSelection(
            log=[
                LogField.ADDRESS,
                LogField.TOPIC0,
                LogField.TOPIC1,
                LogField.DATA,
                LogField.BLOCK_NUMBER,
            ]
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
        print(f"batch={batches} next_block={res.next_block} updates={n} total={total}")

    print(f"Done. total_updates={total}")


asyncio.run(main())
