# 03 — Count all ERC-20 transfers with minimal fields (Python)

Scan a Base block range for every ERC-20 `Transfer` while requesting only the tiny `removed` field, then count the Parquet rows.

**Concepts:** wildcard event queries, minimal field selection, high-throughput Parquet collection.

```bash
pip install -r requirements.txt
export ENVIO_API_TOKEN=...
python base-transfers.py
python count-transfers.py
```

Expected output:

```text
The logs parquet file contains ... entries.
```

Try a larger range or lower `concurrency`. Request additional fields only when downstream analysis uses them.
