# 17 — Collect USDC Transfers to Parquet (Python)

Use `collect_parquet` for a small recent block window.

**Concepts:** confirmed snapshots, typed decoded columns, Parquet table relationships.

```bash
export ENVIO_API_TOKEN=...
pip install -r requirements.txt
python main.py
```

Expected output reports files under `parquet-out/`. Inspect `decoded_logs.parquet` with Polars or DuckDB. Generated output is ignored by Git.
