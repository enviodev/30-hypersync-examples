# 40 — Failed-transaction hotspots (JavaScript)

Scan a small confirmed block window and rank failed calls by target contract and function selector.

**Concepts:** match-all transaction selection, receipt status, calldata selectors, failure aggregation.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output lists the contracts and selectors producing the most failures. Try `BLOCK_WINDOW` or `MAX_RESULTS`.

Production note: receipt status reveals failure but not the reason. Join traces and decoded ABIs to distinguish expected reverts, user errors, bot contention, and protocol defects.
