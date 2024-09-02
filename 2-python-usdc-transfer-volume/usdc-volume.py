import hypersync
from hypersync import LogSelection, FieldSelection, LogField, TransactionField, DataType, ColumnMapping
import asyncio


async def collect_events():
    # Choose network
    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(url="https://base.hypersync.xyz"))

    query = hypersync.Query(
        from_block=0,
        # Select the logs we want
        logs=[LogSelection(
            # USDC contract
            address=["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
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
            transaction=[
                TransactionField.BLOCK_NUMBER,
            ]
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
    )

    print("executing query...")
    await client.collect_parquet("data", query, config)


def main():
    asyncio.run(collect_events())


main()
