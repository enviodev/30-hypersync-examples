import hypersync
from hypersync import LogSelection, LogField, FieldSelection, TransactionField, ColumnMapping, DataType
import asyncio
import os

async def collect_events():
    # Choose network
    bearer_token = os.environ.get("HYPERSYNC_BEARER_TOKEN")
    if not bearer_token:
        print("\033[93mPlease create a token at https://envio.dev/app/api-tokens and set the HYPERSYNC_BEARER_TOKEN environment variable. API tokens will improve the reliability of the service, and in future they may become compulsory.\033[0m")
        bearer_token = "hypersync-examples-repo" # This isn't a real token.

    client = hypersync.HypersyncClient(hypersync.ClientConfig("https://base.hypersync.xyz", bearer_token=bearer_token))

    query = hypersync.Query(
        from_block=0,
        # Select the logs we want
        logs=[LogSelection(
            topics=[["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]], # Transfer event topic
        )], 
        # Select the fields and tables we want
        field_selection=FieldSelection(
            log=[
                # Loading only this simple boolean field makes this erquest much faster
                LogField.REMOVED,
            ],
        ),
    )

    config = hypersync.StreamConfig(
        batch_size=50000,
        concurrency=12,
    )

    await client.collect_parquet("data",query, config)


def main():
    asyncio.run(collect_events())

main()
