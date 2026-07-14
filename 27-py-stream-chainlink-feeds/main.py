import asyncio
import os

import hypersync
from hypersync import BlockField, LogField, LogSelection

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

    max_updates = int(os.environ.get("MAX_UPDATES", "10"))
    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(
            url=os.environ.get("HYPERSYNC_URL", "https://eth.hypersync.xyz"),
            bearer_token=api_token,
        )
    )
    height = await client.get_height()
    safe_height = max(0, height - int(os.environ.get("CONFIRMATIONS", "12")))
    from_block = max(0, safe_height - int(os.environ.get("BLOCK_WINDOW", "5000")))
    aggregator = os.environ.get("AGGREGATOR_ADDRESS")

    # Match AnswerUpdated across all aggregators unless one address is configured.
    log_selection = (
        LogSelection(address=[aggregator], topics=[[ANSWER_UPDATED]])
        if aggregator
        else LogSelection(topics=[[ANSWER_UPDATED]])
    )
    query = hypersync.Query(
        from_block=from_block,
        to_block=safe_height,
        logs=[log_selection],
        field_selection=hypersync.FieldSelection(
            block=[BlockField.NUMBER, BlockField.TIMESTAMP],
            log=[
                LogField.ADDRESS,
                LogField.TOPIC0,
                LogField.TOPIC1,
                LogField.TOPIC2,
                LogField.DATA,
                LogField.BLOCK_NUMBER,
            ]
        ),
    )

    receiver = await client.stream(query, hypersync.StreamConfig())
    total = 0
    while total < max_updates:
        res = await receiver.recv()
        if res is None:
            break
        block_timestamps = {
            block.number: parse_int(block.timestamp) for block in res.data.blocks
        }
        for log in res.data.logs:
            topics = log.topics or []
            if len(topics) < 3:
                continue
            answer = decode_signed(topics[1])
            round_id = parse_int(topics[2])
            updated_at = parse_int(log.data)
            block_timestamp = block_timestamps.get(log.block_number)
            lag = (
                block_timestamp - updated_at
                if block_timestamp is not None and updated_at is not None
                else None
            )
            print(
                f"block={log.block_number} aggregator={log.address} answer_raw={answer} "
                f"round={round_id} oracle_lag_seconds={lag}"
            )
            total += 1
            if total >= max_updates:
                break

    print(f"Done. decoded_updates={total}")


def parse_int(value):
    if value is None:
        return None
    return int(value, 16) if isinstance(value, str) else int(value)


def decode_signed(value):
    raw = parse_int(value)
    if raw is None:
        return None
    return raw - 2**256 if raw >= 2**255 else raw


asyncio.run(main())
