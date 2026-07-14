# 38 — Sandwich-candidate detector (JavaScript)

Discover V2-style swaps across Ethereum, join them to transaction senders, and flag simple front-run/victim/back-run patterns in the same pool and block.

**Concepts:** interface-level discovery, log-to-transaction joins, event ordering, heuristic MEV analysis.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output reports scanned swaps and any candidate triples. Try `BLOCK_WINDOW`, `MAX_RESULTS`, or set `POOL_ADDRESS` to narrow the scan to one V2-style pair.

Production note: this is an explainable heuristic, not a definitive MEV classifier. Routers, private order flow, multi-pool paths, builders, and unrelated adjacent swaps create false positives and negatives.
