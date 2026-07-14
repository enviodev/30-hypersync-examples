# 25 — Contract deployment radar (Rust)

Scan a confirmed Ethereum window for contract-creation receipts and print the created address, deployer, transaction, gas, and status.

**Concepts:** match-all transaction filters, receipt fields, nested Rust response batches, confirmed snapshots.

```bash
export ENVIO_API_TOKEN=...
cargo run --release
```

Expected output contains one line per created contract followed by a deployment count.

Try `MAX_DEPLOYMENTS`, the block window in `main.rs`, or another HyperSync endpoint.

`contract_address` is populated from the transaction receipt; filtering returned rows client-side keeps the query easy to understand.
