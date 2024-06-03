import hypersync
from hypersync import LogSelection, FieldSelection, LogField, TransactionField, DataType, ColumnMapping;
import asyncio

async def collect_events():
    # Choose network
    client = hypersync.HypersyncClient(hypersync.ClientConfig(url="https://eth.hypersync.xyz"))

    print("constructing query...")
    query = hypersync.Query(
        from_block=0,
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
