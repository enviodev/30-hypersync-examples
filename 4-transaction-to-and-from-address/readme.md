### Running this Python script will query the Hypersync API to retrieve all transactions to and from a specific wallet address.

**Prerequisites**

- Install `hypersync` and `asyncio` libraries using pip: `pip install hypersync asyncio`
- Replace `"https://base.hypersync.xyz"` with your desired Hypersync chain URL (see [Hypersync documentation](https://docs.envio.dev/docs/overview-hypersync) for supported chains)
- Update the wallet address (`walletAddress`) as needed

**Usage**

1. Copy-paste this script into a new Python file.
2. Run the script using `python filename.py`
3. Or simply run this script using `python get-transactions.py`

This will execute the query, print progress updates, and display the number of transactions retrieved to and from the specified wallet address. It will also log the block range scanned, the number of blocks scanned, and the time taken for the query.

Enjoy!

**Script:**

```python
import hypersync
import asyncio
from hypersync import BlockField, TransactionField, LogField
import time

walletAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045".lower()

async def main():
    # Create hypersync client using the base hypersync endpoint (default)
    client = hypersync.HypersyncClient("https://base.hypersync.xyz")

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
    res = await client.send_req(query)
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
```

### Enjoy!
