# 14 — Checkpointed, reorg-aware log scan (Python)

Paginate confirmed USDT logs, persist `next_block`, and compare rollback-guard boundaries between pages and runs.

**Concepts:** durable checkpoints, `rollback_guard`, confirmed height, atomic checkpoint writes.

```bash
export ENVIO_API_TOKEN=...
pip install -r requirements.txt
python main.py
```

Expected output shows page progress and writes `.checkpoint.json`. Run it again to resume.

Try `MAX_PAGES`, `CONFIRMATIONS`, or `CHECKPOINT_FILE`. If a reorg is detected, a real downstream sink must roll back its affected rows; this demo resets its in-memory count and shows the rewind boundary.
