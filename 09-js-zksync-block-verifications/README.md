# 09 — zkSync commit-to-verification latency (JavaScript)

Decode the legacy zkSync rollup contract's Ethereum L1 `BlockCommit` and `BlockVerification` events, pair them by zkSync block number, and estimate latency in L1 blocks.

**Concepts:** multiple event signatures, address scoping, event correlation.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output shows scan progress followed by paired event count and average L1 blocks to verification.

Try `FROM_BLOCK`, `TO_BLOCK`, `CONFIRMATIONS`, or another contract/event pair. The default historical window is intentionally small but contains both event types.

This is historical protocol analysis of the legacy zkSync contract, not a current zkSync operational monitor.
