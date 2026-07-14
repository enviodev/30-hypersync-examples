# 30 — Stream with tuned StreamConfig (Python)

Benchmark the default stream configuration against explicit concurrency and batch sizing over the exact same confirmed block range.

**Concepts:** fair A/B measurement, concurrency, batch size, throughput metrics.

See [Stream config & tuning](https://docs.envio.dev/docs/HyperSync/stream-config).

```bash
export ENVIO_API_TOKEN=...
pip install -r requirements.txt
python main.py
```

Expected output compares seconds, blocks/sec, and transactions/sec. Try `BLOCK_WINDOW` and the `StreamConfig` values.

Run multiple times before drawing conclusions; network conditions and cache warmth affect small benchmarks.
