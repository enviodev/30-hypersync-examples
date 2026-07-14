# 22 — Stream ERC-20 Approval events (JS)

Stream Approval logs for USDT and print a sample.

**Concepts:** approval topics, `Decoder`, 6-decimal token formatting.

```bash
export ENVIO_API_TOKEN=...
npm install
npm start
```

Expected output shows owner, spender, and USDT allowance. Try `MAX_EVENTS` or another token with matching decimals.
