# 15 — Stream wallet activity (Rust)

Stream transactions to/from a wallet plus ERC-20 transfers involving it.

**Concepts:** Rust filter composition, OR branches, confirmed snapshots.

```bash
export ENVIO_API_TOKEN=...
cargo run --release
```

Stops after `MAX_BATCHES` (default 3).

Expected output reports logs and transactions per batch. Try the wallet constant, range, or `MAX_BATCHES`.
