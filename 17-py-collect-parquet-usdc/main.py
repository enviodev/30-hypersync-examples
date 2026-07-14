import asyncio
import os

import hypersync
from hypersync import (
    BlockField,
    FieldSelection,
    HexOutput,
    LogField,
    LogSelection,
    StreamConfig,
    TransactionField,
)


async def main():
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens"
        )

    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(url="https://eth.hypersync.xyz", bearer_token=api_token)
    )

    height = await client.get_height()
    # Keep the window small for a fast local demo
    from_block = max(0, height - 200)
    usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    transfer = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

    query = hypersync.Query(
        from_block=from_block,
        to_block=height,
        logs=[LogSelection(address=[usdc], topics=[[transfer]])],
        field_selection=FieldSelection(
            block=[BlockField.NUMBER, BlockField.TIMESTAMP],
            transaction=[TransactionField.HASH],
            log=[
                LogField.ADDRESS,
                LogField.TOPIC0,
                LogField.TOPIC1,
                LogField.TOPIC2,
                LogField.DATA,
            ],
        ),
    )

    config = StreamConfig(
        hex_output=HexOutput.PREFIXED,
        event_signature="Transfer(address indexed from, address indexed to, uint256 value)",
    )

    out_dir = "parquet-out"
    result = await client.collect_parquet(out_dir, query, config)
    # collect_parquet returns (num_blocks, num_transactions, num_logs, num_traces) in 1.2.x
    print(f"Wrote parquet under ./{out_dir}; result={result}")


asyncio.run(main())
