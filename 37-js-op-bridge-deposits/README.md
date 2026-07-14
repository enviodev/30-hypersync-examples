# 37 — OP Mainnet bridge deposits (JavaScript)

Track Ethereum deposits entering OP Mainnet through the canonical `OptimismPortal`.

**Concepts:** bridge initiation events, three indexed parameters, opaque payload sizing.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output lists L1 sender, L2 target, deposit version, payload size, and transaction. Try `BLOCK_WINDOW` or `MAX_RESULTS`.

Production note: `TransactionDeposited` records initiation on L1. A complete bridge tracker must derive or join the corresponding L2 deposit transaction and account for protocol upgrades.
