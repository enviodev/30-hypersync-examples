### Running this Python script will query the Hypersync API to retrieve all transactions to and from a specific wallet address, with pagination to handle large data sets.

**Prerequisites**

- Install `hypersync` and `asyncio` libraries using pip: `pip install hypersync asyncio`
- Replace `"https://eth.hypersync.xyz"` with your desired Hypersync chain URL (see [Hypersync documentation](https://docs.envio.dev/docs/overview-hypersync) for supported chains)
- Update the wallet address (`walletAddress`) as needed

**Usage**

1. Simply run this script using `python fetch-transactions.py`

This will execute the query, paginate through the results, print progress updates, and display the number of transactions retrieved to and from the specified wallet address.

Enjoy!
