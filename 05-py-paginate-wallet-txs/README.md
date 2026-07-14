# 05 — Manual wallet pagination (Python)

Walk a transaction query page by page until the snapshot height, including pages with no matching transactions.

**Concepts:** `get()`, `next_block`, progress guards, fixed snapshots.

```bash
pip install -r requirements.txt
export ENVIO_API_TOKEN=...
python get-transaction-pagination.py
```

Expected output prints each scanned range, matches in that page, elapsed time, and running total.

Try `WALLET_ADDRESS`, `HYPERSYNC_URL`, or `FROM_BLOCK`.

Production note: completion is `next_block >= snapshot_height`, not “the page contained no matches.” Prefer `stream()` when you do not need to manage pages yourself.
