import hypersync
import asyncio
from hypersync import TransactionField
import time

walletAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045".lower()


async def main():
    # Create hypersync client using the base hypersync endpoint (default)
    client = hypersync.HypersyncClient(hypersync.ClientConfig(url="https://polygon.hypersync.xyz"))

    # Initial block to start the query from
    current_block = 0

    while True:
        # The query to run
        query = hypersync.Query(
            from_block=current_block,
            logs=[],
            transactions=[
                # get all transactions coming from and going to any of our addresses.
                hypersync.TransactionSelection(from_=[walletAddress]),
                hypersync.TransactionSelection(to=[walletAddress]),
            ],
            field_selection=hypersync.FieldSelection(
                transaction=[
                    TransactionField.HASH,
                    TransactionField.FROM,
                    TransactionField.TO,
                    TransactionField.VALUE,
                    TransactionField.INPUT,
                ]
            )
        )

        start_block = query.from_block
        print(f"Starting the query from block {start_block}...")

        start_time = time.time()
        res = await client.get(query)
        end_time = time.time()

        end_block = res.next_block
        num_blocks_scanned = end_block - start_block
        time_taken = end_time - start_time

        print(f"Query completed.")
        print(f"Started from block: {start_block}")
        print(f"Scanned up to block: {end_block}")
        print(f"Number of blocks scanned: {num_blocks_scanned}")
        print(f"Time taken for the query: {time_taken:.2f} seconds")
        print(f"Number of transactions fetched: {len(res.data.transactions)}")

        # Update the current block to the next block for the next query
        current_block = end_block

        # Break the loop if there are no more blocks to scan
        if not res.data.transactions:
            break

asyncio.run(main())
