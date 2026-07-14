# WIP: all Fuel transactions (Rust)

> **Status: work in progress / unfinished.** This example is incomplete and may not build or run against current HyperFuel clients. Prefer the official HyperSync / HyperFuel client examples until this is finished.

Intended goal: HyperFuel query that saves all transaction information into parquet locally.

## Prerequisites

- Rust toolchain
- `ENVIO_API_TOKEN` ([docs](https://docs.envio.dev/docs/HyperSync/api-tokens))

```bash
export ENVIO_API_TOKEN="your-token-here"
```

## Intended usage

```bash
cargo run --release
```

Transaction data would be saved under `data/transaction.parquet`.
