# 08 — USDT Parquet pipeline (JavaScript + Polars)

Collect decoded USDT transfers with the Node client, then rank senders by exact transfer volume in Python.

**Concepts:** `collectParquet`, decoded columns, cross-language analytics, integer precision.

```bash
npm install
python -m pip install polars
export ENVIO_API_TOKEN=...
npm start
python data-vis.py
```

Expected output is a Polars table of top senders with transfer count, raw integer volume, and USDT volume.

Try changing the 1,000-block window or grouping by `to` instead of `from`.

Generated `data/` is ignored by Git.
