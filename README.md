# HyperSync examples

Thirty focused HyperSync examples across **Python**, **Node.js/TypeScript**, **Rust**, and **curl**.

Most examples prefer **`stream`** (or `collect_*`) for throughput. A few use `get` / presets where that is the clearer teaching point.

> Prefer the official client library `examples/` folders when you want the absolute latest API surface:
> - [hypersync-client-node/examples](https://github.com/enviodev/hypersync-client-node/tree/main/examples)
> - [hypersync-client-python/examples](https://github.com/enviodev/hypersync-client-python/tree/main/examples)
> - [hypersync-client-rust/examples](https://github.com/enviodev/hypersync-client-rust/tree/main/examples)

## Prerequisites

HyperSync requires an API token (since 3 Nov 2025).

1. Create a token: [API tokens](https://docs.envio.dev/docs/HyperSync/api-tokens)
2. Export it:

```bash
export ENVIO_API_TOKEN="your-token-here"
```

Use `https://` endpoints (for example `https://eth.hypersync.xyz`). See [supported networks](https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks).

## Naming

Folders use `NN-lang-short-slug`:

| Prefix | Client |
|--------|--------|
| `py` | Python (`hypersync` 1.2.x) |
| `js` / `ts` | Node.js / TypeScript (`@envio-dev/hypersync-client` 1.4.x) |
| `rs` | Rust (`hypersync-client` 1.4.x) |
| `curl` | Raw HTTP |

## Examples

| # | Folder | Lang | Pattern |
|---|--------|------|---------|
| 01 | `01-py-preset-contract-logs` | Python | Preset `get` for contract logs |
| 02 | `02-py-stream-usdc-volume` | Python | Stream + aggregate USDC volume |
| 03 | `03-py-stream-erc20-base` | Python | Stream ERC-20 transfers on Base |
| 04 | `04-py-tx-to-from-address` | Python | Transactions to/from an address |
| 05 | `05-py-paginate-wallet-txs` | Python | Paginate with `get` + `next_block` |
| 06 | `06-js-stream-uniswap-pools` | JS | Stream Uniswap V3 `PoolCreated` |
| 07 | `07-curl-raw-query` | curl | Raw `/query` POST |
| 08 | `08-js-collect-usdt-parquet` | JS | Collect USDT transfers → Parquet |
| 09 | `09-js-zksync-block-verifications` | JS | zkSync verification events |
| 10 | `10-ts-wallet-erc20-activity` | TS | Wallet ERC-20 activity |
| 11 | `11-py-block-by-timestamp` | Python | Binary-search block by timestamp |
| 12 | `12-js-earliest-tx-multichain` | JS | Earliest tx across chains |
| 13 | `13-js-stream-height` | JS | `streamHeight` tip watcher |
| 14 | `14-py-stream-logs-progress` | Python | Stream logs with progress |
| 15 | `15-rs-stream-wallet` | Rust | Stream wallet txs + ERC-20 |
| 16 | `16-js-stream-decode-transfers` | JS | Stream + `Decoder` for Transfers |
| 17 | `17-py-collect-parquet-usdc` | Python | `collect_parquet` USDC Transfers |
| 18 | `18-js-stream-native-eth-traces` | JS | Native ETH via traces |
| 19 | `19-rs-stream-erc20-transfers` | Rust | Stream ERC-20 Transfer logs |
| 20 | `20-js-preset-logs-of-event` | JS | `presetQueryLogsOfEvent` |
| 21 | `21-py-stream-uniswap-swaps` | Python | Stream + decode Uniswap V3 Swaps |
| 22 | `22-js-stream-erc20-approvals` | JS | Stream ERC-20 Approval events |
| 23 | `23-py-get-tx-by-hash` | Python | Lookup transaction by hash |
| 24 | `24-js-stream-blocks-and-txs` | JS | Stream blocks + transactions |
| 25 | `25-rs-stream-height` | Rust | Height stream |
| 26 | `26-js-stream-join-transactions` | JS | `JoinMode` logs ↔ txs |
| 27 | `27-py-stream-chainlink-feeds` | Python | Stream Chainlink `AnswerUpdated` |
| 28 | `28-curl-blocks-field-selection` | curl | curl + minimal field selection |
| 29 | `29-js-stream-multi-wallet-erc20` | JS | Multi-address ERC-20 stream |
| 30 | `30-py-stream-config-tuning` | Python | Stream with tuned `StreamConfig` |

Extra (not counted in the 30): `wip-rs-fuel-all-txs` — unfinished HyperFuel experiment.

## How to run

### Python

```bash
cd 14-py-stream-logs-progress
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ENVIO_API_TOKEN="your-token-here"
python main.py
```

### Node.js / TypeScript

```bash
cd 13-js-stream-height
npm install
export ENVIO_API_TOKEN="your-token-here"
node main.js
```

### Rust

```bash
cd 19-rs-stream-erc20-transfers
export ENVIO_API_TOKEN="your-token-here"
cargo run --release
```

### curl

See `07-curl-raw-query/README.md` and `28-curl-blocks-field-selection/README.md`.

## Documentation

- [HyperSync overview](https://docs.envio.dev/docs/HyperSync/overview)
- [API tokens](https://docs.envio.dev/docs/HyperSync/api-tokens)
- [Query reference](https://docs.envio.dev/docs/HyperSync/hypersync-query)
- [Clients](https://docs.envio.dev/docs/HyperSync/hypersync-clients)
- [Supported networks](https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks)
- [Stream config & tuning](https://docs.envio.dev/docs/HyperSync/stream-config)
