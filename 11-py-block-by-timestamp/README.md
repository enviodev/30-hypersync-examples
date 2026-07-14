# 11 — Find the block closest to a UTC timestamp (Python)

Binary-search block timestamps while requesting just one block field per query.

**Concepts:** `get_height`, minimal block queries, exclusive bounds, binary search.

```bash
uv sync
export ENVIO_API_TOKEN=...
export TARGET_TIME="2024-01-01T00:00:00Z"
uv run python get-block.py
```

Expected output shows each midpoint checked and the closest block number with elapsed time.

Try another ISO-8601 `TARGET_TIME` or `HYPERSYNC_URL`. Naive timestamps are treated as UTC.
