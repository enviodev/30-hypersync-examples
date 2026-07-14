# 12 — Earliest wallet transaction across chains (JavaScript)

Query ten HyperSync networks with bounded concurrency and report the first direct transaction found on each.

**Concepts:** multichain clients, concurrency limiting, first-result streams, per-chain errors.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start -- 0xBEa9f7FD27f4EE20066F18DEF0bc586eC221055A
```

Expected output lists chain, first block, UTC timestamp, and transaction hash—or a clear no-activity/error result.

Try `CONCURRENCY`, `CONFIRMATIONS`, or `WALLET_ADDRESS`.

This finds direct transactions only. Token transfers may exist for an address with no direct native transaction match.
