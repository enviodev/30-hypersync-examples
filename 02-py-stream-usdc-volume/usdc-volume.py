import hypersync
from hypersync import LogSelection, FieldSelection, LogField, TransactionField, DataType, ColumnMapping
import asyncio
import os

async def collect_events():
    # Choose network
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
        )

    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(
            url=os.environ.get("HYPERSYNC_URL", "https://eth.hypersync.xyz"),
            bearer_token=api_token,
        )
    )

    query = hypersync.Query(
        from_block=18_000_000,
        to_block=18_010_000,
        # Select the logs we want
        logs=[LogSelection(
            address=["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"], # USDC contract
            topics=[["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]], # Transfer event topic
        )], 
        # Select the fields and tables we want
        field_selection=FieldSelection(
            log=[
                LogField.TOPIC0,
                LogField.TOPIC1,
                LogField.TOPIC2,
                LogField.TOPIC3,
                LogField.DATA,
                LogField.TRANSACTION_HASH,
            ],
            transaction=[
                TransactionField.BLOCK_NUMBER,
            ]
        ),
    )

    config = hypersync.StreamConfig(
        hex_output=hypersync.HexOutput.PREFIXED,
        column_mapping=ColumnMapping(
            # Keep decoded token amounts as exact integers for downstream calculations.
            decoded_log={
                # USDC values are integers. Float64 can silently lose precision.
                "value": DataType.UINT64,
            },
        ),
        event_signature="Transfer(address indexed from, address indexed to, uint256 value)",
    )

    print("executing query...")
    await client.collect_parquet("data", query, config)


def main():
    asyncio.run(collect_events())

main()
