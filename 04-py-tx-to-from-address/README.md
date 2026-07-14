# 04 — Direct wallet transactions to a snapshot (Python)

Stream all direct transactions sent by or to a wallet up to a confirmed chain snapshot.

**Concepts:** OR selections, automatic stream pagination, confirmed boundaries.

```bash
pip install -r requirements.txt
export ENVIO_API_TOKEN=...
export WALLET_ADDRESS=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
python get-transactions.py
```

Expected output shows per-batch progress, a final count, and three sample transactions.

Use `HYPERSYNC_URL`, `FROM_BLOCK`, and `CONFIRMATIONS` to change the network or range.

This example covers direct native transactions. ERC-20 transfers are logs; see example 10 for a combined wallet statement.
