# HyperSync examples

Curated HyperSync client examples in Python, Node.js/TypeScript, curl, and a WIP Rust (Fuel) sample.

> **Note:** This repository is named historically; it currently ships the examples listed below (not a full set of 30). Prefer the official client library example folders for the latest APIs:
> - [hypersync-client-node/examples](https://github.com/enviodev/hypersync-client-node/tree/main/examples)
> - [hypersync-client-python/examples](https://github.com/enviodev/hypersync-client-python/tree/main/examples)

## Prerequisites

HyperSync requires an API token (enforced since 3 Nov 2025).

1. Create a token: [API tokens docs](https://docs.envio.dev/docs/HyperSync/api-tokens)
2. Export it in your shell:

```bash
export ENVIO_API_TOKEN="your-token-here"
```

Use `https://` HyperSync endpoints (for example `https://eth.hypersync.xyz`). See [supported networks](https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks).

## Examples

| # | Folder | Language | What it shows |
|---|--------|----------|---------------|
| 1 | `1-python-fetch-all-logs` | Python | Fetch all logs for a contract in a block range |
| 2 | `2-python-usdc-transfer-volume` | Python | Aggregate USDC transfer volume |
| 3 | `3-python-all-erc20-transfers-base` | Python | Stream ERC-20 transfers on Base |
| 4 | `4-python-transaction-to-and-from-address` | Python | Transactions to/from an address |
| 5 | `5-python-hypersync-pagination` | Python | Paginate wallet transactions |
| 6 | `6-nodejs-uniswap-pool-addresses` | Node.js | Uniswap V3 `PoolCreated` events |
| 7 | `7-curl-request` | curl | Raw HTTP `/query` example |
| 8 | `8-nodejs-usdt-transfer-js-parquet` | Node.js | USDT transfers → Parquet |
| 9 | `9-nodejs-zksync-block-verifications` | Node.js | zkSync block verification events |
| 10 | `10-ts-wallet-erc20-data` | TypeScript | ERC-20 activity for a wallet |
| 12 | `12-get-block-given-timestamp` | Python | Binary-search block by timestamp |
| 13 | `13-get-earliest-tx-from-address` | Node.js | Earliest tx for an address across chains |
| — | `WIP-rust-all-fuel-txs` | Rust | **WIP / unfinished** Fuel parquet export |

## How to run

### Python

```bash
cd 1-python-fetch-all-logs
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ENVIO_API_TOKEN="your-token-here"
python fetch-logs.py
```

### Node.js

```bash
cd 6-nodejs-uniswap-pool-addresses
npm install
export ENVIO_API_TOKEN="your-token-here"
node get-pools.js
```

### TypeScript (`10-ts-wallet-erc20-data`)

```bash
cd 10-ts-wallet-erc20-data
npm install
export ENVIO_API_TOKEN="your-token-here"
npx ts-node src/index.ts 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

### curl

See `7-curl-request/readme.md`. Include an `Authorization: Bearer $ENVIO_API_TOKEN` header.

## Documentation

- [HyperSync overview](https://docs.envio.dev/docs/HyperSync/overview)
- [API tokens](https://docs.envio.dev/docs/HyperSync/api-tokens)
- [Supported networks](https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks)
- [Query docs](https://docs.envio.dev/docs/HyperSync/hypersync-query)
