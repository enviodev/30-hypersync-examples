import hypersync
from hypersync import LogSelection, LogField, FieldSelection, TransactionField, ColumnMapping, DataType
import asyncio


async def collect_events():
    # Choose network
    client = hypersync.HypersyncClient(
        hypersync.ClientConfig("https://arbitrum.hypersync.xyz"))

    query = hypersync.Query(
        from_block=200000000,
        # Select the logs we want
        logs=[LogSelection(
            # Transfer event topic
            topics=[
                ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]],
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
        ),
    )

    config = hypersync.StreamConfig(
        hex_output=hypersync.HexOutput.PREFIXED,
        column_mapping=ColumnMapping(
            # map value columns to float so we can do calculations with them
            decoded_log={
                "value": DataType.FLOAT64,
            },
        ),
        event_signature="Transfer(address indexed from, address indexed to, uint256 value)",
        batch_size=50000,
        concurrency=12,
    )

    await client.collect_parquet("data", query, config)


def main():
    asyncio.run(collect_events())


main()
