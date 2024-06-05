### Running this Python script will query the Hypersync API to retrieve all transactions to and from a specific wallet address.

**Prerequisites**

- Install dependencies using use: `uv pip install -r requirements.txt`
- Replace `"https://base.hypersync.xyz"` with your desired Hypersync chain URL (see [Hypersync documentation](https://docs.envio.dev/docs/overview-hypersync) for supported chains)
- Update the wallet address (`walletAddress`) as needed

**Usage**

1. Copy-paste this script into a new Python file.
2. Run the script using `python filename.py`
3. Or simply run this script using `python get-transactions.py`

This will execute the query, print progress updates, and display the number of transactions retrieved to and from the specified wallet address. It will also log the block range scanned, the number of blocks scanned, and the time taken for the query.

### Enjoy!
