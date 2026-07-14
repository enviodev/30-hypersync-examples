# 01 — Paginate contract logs with a preset (Python)

Retrieve every log for one contract over a bounded range using `preset_query_logs` and `next_block`.

**Concepts:** preset queries, exclusive ranges, manual pagination.

```bash
pip install -r requirements.txt
export ENVIO_API_TOKEN=...
python fetch-logs.py
```

Expected shape:

```text
page=1 range=[0, 19670000) logs=... total=...
Done. Retrieved ... logs ...
```

Try another `CONTRACT_ADDRESS`, `FROM_BLOCK`, `TO_BLOCK`, or `HYPERSYNC_URL`.

Production note: `get()` returns one page. Continue from `next_block`; a zero-match page is not a reliable completion signal.
