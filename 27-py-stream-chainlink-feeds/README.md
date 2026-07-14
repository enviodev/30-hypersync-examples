# 27 — Stream Chainlink AnswerUpdated (Python)

Decode `AnswerUpdated` across Chainlink aggregators and compare each oracle timestamp with its containing block timestamp.

**Concepts:** indexed signed values, joined block timestamps, oracle-lag calculation.

Proxies don't emit this event — we match the topic across aggregators.

```bash
export ENVIO_API_TOKEN=...
pip install -r requirements.txt
python main.py
```

Expected output shows aggregator, raw answer, round, and lag seconds. Try `AGGREGATOR_ADDRESS`, `MAX_UPDATES`, or `BLOCK_WINDOW`.

Raw answer decimals are feed-specific; do not label values as prices until you know the aggregator metadata.
