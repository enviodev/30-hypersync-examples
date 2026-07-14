import hypersync
from hypersync import FieldSelection, LogField, LogSelection
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
            url=os.environ.get("HYPERSYNC_URL", "https://base.hypersync.xyz"),
            bearer_token=api_token,
        )
    )

    query = hypersync.Query(
        from_block=10_000_000,
        to_block=10_020_000,
        # Select the logs we want
        logs=[LogSelection(
            topics=[["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]], # Transfer event topic
        )], 
        # Select the fields and tables we want
        field_selection=FieldSelection(
            log=[
                # Loading one tiny field is enough when the goal is only to count rows.
                LogField.REMOVED,
            ],
        ),
    )

    config = hypersync.StreamConfig(
        batch_size=50000,
        concurrency=12,
    )

    await client.collect_parquet("data", query, config)


def main():
    asyncio.run(collect_events())

main()
