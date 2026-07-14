import os
import hypersync
import asyncio
from hypersync import TransactionField
import time

WALLET_ADDRESS = os.environ.get(
    "WALLET_ADDRESS", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
).lower()


async def main():
    # Create hypersync client using the polygon hypersync endpoint
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
        )

    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(
            url=os.environ.get("HYPERSYNC_URL", "https://polygon.hypersync.xyz"),
            bearer_token=api_token,
        )
    )
    snapshot_height = await client.get_height()

    # Initial block to start the query from
    current_block = int(os.environ.get("FROM_BLOCK", "0"))
    total = 0
    pages = 0

    while current_block < snapshot_height:
        # The query to run
        query = hypersync.Query(
            from_block=current_block,
            to_block=snapshot_height,
            logs=[],
            transactions=[
                # get all transactions coming from and going to any of our addresses.
                hypersync.TransactionSelection(from_=[WALLET_ADDRESS]),
                hypersync.TransactionSelection(to=[WALLET_ADDRESS]),
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

        pages += 1
        total += len(res.data.transactions)
        print("Query completed.")
        print(f"Started from block: {start_block}")
        print(f"Scanned up to block: {end_block}")
        print(f"Number of blocks scanned: {num_blocks_scanned}")
        print(f"Time taken for the query: {time_taken:.2f} seconds")
        print(f"Number of transactions fetched: {len(res.data.transactions)}")
        print(f"Running total: {total} across {pages} page(s)")

        # Update the current block to the next block for the next query
        if end_block <= current_block:
            raise RuntimeError("HyperSync did not advance next_block")
        current_block = end_block

    print(f"Done at snapshot height {snapshot_height}. total_transactions={total}")

asyncio.run(main())
