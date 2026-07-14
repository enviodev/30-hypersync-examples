import asyncio
import os

import hypersync
from hypersync import LogField, LogSelection


TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
ZERO_TOPIC = "0x" + "0" * 64
USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"


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
    from_block = max(0, safe_height - int(os.environ.get("BLOCK_WINDOW", "100000")))

    query = hypersync.Query(
        from_block=from_block,
        to_block=safe_height,
        logs=[
            LogSelection(address=[USDC], topics=[[TRANSFER], [ZERO_TOPIC]]),
            LogSelection(address=[USDC], topics=[[TRANSFER], [], [ZERO_TOPIC]]),
        ],
        field_selection=hypersync.FieldSelection(
            log=[
                LogField.BLOCK_NUMBER,
                LogField.TRANSACTION_HASH,
                LogField.TOPIC0,
                LogField.TOPIC1,
                LogField.TOPIC2,
                LogField.DATA,
            ]
        ),
    )

    result = await client.collect(query, hypersync.StreamConfig())
    minted = 0
    burned = 0
    mint_count = 0
    burn_count = 0

    for log in result.data.logs:
        topics = log.topics or []
        if len(topics) < 3 or not log.data:
            continue
        value = int(log.data, 16)
        if topics[1] == ZERO_TOPIC:
            minted += value
            mint_count += 1
        if topics[2] == ZERO_TOPIC:
            burned += value
            burn_count += 1

    print(f"range=[{from_block}, {safe_height})")
    print(f"minted={format_usdc(minted)} USDC across {mint_count} events")
    print(f"burned={format_usdc(burned)} USDC across {burn_count} events")
    print(f"net_supply_change={format_usdc(minted - burned)} USDC")


def format_usdc(value: int) -> str:
    sign = "-" if value < 0 else ""
    value = abs(value)
    return f"{sign}{value // 10**6:,}.{value % 10**6:06d}"


asyncio.run(main())
