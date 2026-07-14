# 23 — Get transaction by hash (Python)

Look up a known transaction hash with a transaction selection filter.

**Concepts:** indexed hash lookup, `JoinNothing`, minimal transaction fields.

```bash
export ENVIO_API_TOKEN=...
pip install -r requirements.txt
python main.py
```

Expected output shows hash, block, sender, recipient, and wei value. Try `TX_HASH` or `HYPERSYNC_URL`.
