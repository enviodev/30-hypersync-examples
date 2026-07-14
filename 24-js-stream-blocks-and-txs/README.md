# 24 — Stream blocks and transactions (JS)

Build a compact activity feed for confirmed blocks with transaction count, gas used, and base fee.

**Concepts:** `includeAllBlocks`, block/transaction joins, per-block aggregation.

```bash
export ENVIO_API_TOKEN=...
npm install
npm start
```

Expected output is a `console.table` with one row per block. Try `BLOCKS` or `CONFIRMATIONS`.
