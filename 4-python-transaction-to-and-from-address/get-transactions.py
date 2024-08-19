import hypersync
import asyncio
from hypersync import BlockField, TransactionField, LogField
import time
import os

# Just an arbitrary address with some activitiy: https://basescan.org/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
walletAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045".lower()


async def main():
    # Create hypersync client using the base hypersync endpoint (default)
    bearer_token = os.environ.get("HYPERSYNC_BEARER_TOKEN")
    if not bearer_token:
        print("\033[93mPlease create a token at https://envio.dev/app/api-tokens and set the HYPERSYNC_BEARER_TOKEN environment variable. API tokens will improve the reliability of the service, and in future they may become compulsory.\033[0m")
        bearer_token = "hypersync-examples-repo" # This isn't a real token.

    client = hypersync.HypersyncClient(hypersync.ClientConfig("https://base.hypersync.xyz", bearer_token=bearer_token))

    # The query to run
    query = hypersync.Query(
        from_block=0,
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

asyncio.run(main())
