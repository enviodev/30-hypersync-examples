# 26 — Join logs to transactions (JS)

Run the same USDC query with `JoinNothing` and the default log-to-transaction join, compare result counts, then map logs to transaction context.

**Concepts:** join semantics, payload tradeoffs, hash-based correlation.

```bash
export ENVIO_API_TOKEN=...
npm install
npm start
```

Expected output includes a mode comparison table and five log-to-transaction mappings. Try the block window or token address.
