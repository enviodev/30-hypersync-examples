import hypersync
from hypersync import LogSelection, LogField, FieldSelection, TransactionField, ColumnMapping, DataType
import asyncio

async def collect_events():
    # Choose network
    client = hypersync.HypersyncClient("https://base.hypersync.xyz")

    query = hypersync.Query(
        from_block=0,
        # Select the logs we want
        logs=[LogSelection(
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

    config = hypersync.ParquetConfig(
        path="data",
        hex_output=True, 
        batch_size=50000,
        concurrency=12,
    )

    await client.create_parquet_folder(query, config)


def main():
    asyncio.run(collect_events())

main()