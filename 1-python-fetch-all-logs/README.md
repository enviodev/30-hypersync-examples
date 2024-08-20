### Running this Python script will query the Hypersync API to retrieve all logs from a specific contract within a specified block range.

**Prerequisites**

- Install `hypersync` and `asyncio` libraries using uv or pip: `uv pip install -r requirements.txt`
- Replace `"https://eth.hypersync.xyz"` with your desired Hypersync chain URL (see [Hypersync documentation](https://docs.envio.dev/docs/overview-hypersync) for supported chains)
- Update the contract address (`eigenlayer_slasher`) and block range as needed

**Usage**

1. Copy-paste this script into a new Python file.
2. Run the script using `python filename.py`
3. Or simply run this script using `python fetch-logs.py`

This will execute the query, print progress updates, and display the number of logs retrieved from the specified contract.

Enjoy!
