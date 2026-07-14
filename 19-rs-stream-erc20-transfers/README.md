# 19 — Stream ERC-20 Transfers (Rust)

Stream USDT Transfer logs from a recent window.

**Concepts:** Rust stream receiver, field selection, confirmed snapshot, batch counters.

```bash
export ENVIO_API_TOKEN=...
cargo run --release
```

Expected output reports batch, `next_block`, and running log total. Try `MAX_BATCHES` or another token address.
