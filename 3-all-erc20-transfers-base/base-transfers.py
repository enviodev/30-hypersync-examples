import hypersync
from hypersync import LogSelection, LogField, FieldSelection, TransactionField, ColumnMapping, DataType
import asyncio

async def collect_events():
    # Choose network
    client = hypersync.HypersyncClient(hypersync.ClientConfig("https://base.hypersync.xyz"))

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
