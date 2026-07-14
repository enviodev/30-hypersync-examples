# 40 HyperSync examples

Forty runnable examples that move from a first query to production-minded blockchain data pipelines in Python, JavaScript/TypeScript, Rust, and raw HTTP.

These examples are organized around outcomes: discover pools and NFT mints, build wallet and stablecoin statements, investigate liquidations and failed transactions, monitor upgrades and governance, inspect bridges and account abstraction, and understand safe pagination and checkpointing.

## The five-minute path

New to HyperSync? Run these in order:

1. [`28-curl-blocks-field-selection`](28-curl-blocks-field-selection) — see the JSON API and why field selection matters.
2. [`20-js-preset-logs-of-event`](20-js-preset-logs-of-event) — make a focused one-shot query.
3. [`16-js-stream-decode-transfers`](16-js-stream-decode-transfers) — stream and decode an event.
4. [`26-js-stream-join-transactions`](26-js-stream-join-transactions) — attach transaction context to matching logs.
5. [`14-py-stream-logs-progress`](14-py-stream-logs-progress) — checkpoint a paginated scan and detect reorg boundaries.

## Pick a real project

- **Activity feeds:** follow [NFT mints](31-js-nft-mint-radar), [Aave liquidations](34-js-aave-liquidations), or [ENS registrations](39-js-ens-registrations).
- **Protocol analytics:** measure [stablecoin supply flows](32-py-stablecoin-supply-flows), [account-abstraction operations](33-js-account-abstraction-ops), or [OP bridge deposits](37-js-op-bridge-deposits).
- **Security and operations:** monitor [proxy upgrades](35-js-proxy-upgrade-monitor) or rank [failed-transaction hotspots](40-js-failed-transaction-hotspots).
- **Governance intelligence:** discover [cross-DAO proposals](36-js-governance-proposals) and their voting windows.
- **MEV research:** combine joins and log ordering to identify [sandwich candidates](38-js-sandwich-candidates).

## Prerequisites

HyperSync requires an API token.

1. Follow the [API token guide](https://docs.envio.dev/docs/HyperSync/api-tokens).
2. Export it before running an example:

```bash
export ENVIO_API_TOKEN="your-token-here"
```

Most examples also accept:

```bash
export HYPERSYNC_URL="https://eth.hypersync.xyz"
export CONFIRMATIONS=12
```

See the [supported networks](https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks) and [query reference](https://docs.envio.dev/docs/HyperSync/hypersync-query).

## Learning tracks

### Start — understand the query model

Examples 01, 05, 07, 13, 20, 23, 28, and 31 cover presets, pagination, field selection, height streams, lookups, and interface-level event discovery.

### Build — turn data into an answer

Examples 02, 06, 08–12, 16–18, 21, 22, 24–27, 29, 32–34, and 36–39 decode and aggregate real protocol, wallet, deployment, trace, governance, bridge, MEV, and multichain data.

### Ship — use safe and scalable patterns

Examples 03–05, 14, 15, 17–19, 30, 35, and 40 cover snapshots, checkpointing, Parquet, language parity, stream tuning, and operational monitoring.

## Catalog

| # | Example | Language | Level | Typical run | What you learn | Output |
|---:|---|---|---|---|---|---|
| 01 | [`preset-contract-logs`](01-py-preset-contract-logs) | Python | Starter | <1 min | Presets + correct `next_block` pagination | Page progress + total |
| 02 | [`stream-usdc-volume`](02-py-stream-usdc-volume) | Python | Builder | 1–3 min | Exact integer token analytics with Polars | Parquet + volume summary |
| 03 | [`stream-erc20-base`](03-py-stream-erc20-base) | Python | Builder | 1–3 min | Minimal field selection for fast counting | Parquet row count |
| 04 | [`tx-to-from-address`](04-py-tx-to-from-address) | Python | Builder | 1–3 min | Direct wallet transactions to a confirmed snapshot | Counts + samples |
| 05 | [`paginate-wallet-txs`](05-py-paginate-wallet-txs) | Python | Starter | 1–3 min | Manual pagination without empty-page bugs | Per-page metrics |
| 06 | [`stream-uniswap-pools`](06-js-stream-uniswap-pools) | JavaScript | Builder | <1 min | Topic hashing + event decoding | Token pair, fee, pool |
| 07 | [`raw-query`](07-curl-raw-query) | curl | Starter | Seconds | Raw JSON query shape | JSON response |
| 08 | [`collect-usdt-parquet`](08-js-collect-usdt-parquet) | JS + Python | Builder | 1–3 min | Exact integers, Parquet, Polars | Top senders by volume |
| 09 | [`zksync-block-verifications`](09-js-zksync-block-verifications) | JavaScript | Advanced | 1–3 min | Multi-event decoding + latency pairing | Commit/verify latency |
| 10 | [`wallet-erc20-activity`](10-ts-wallet-erc20-activity) | TypeScript | Advanced | 1–5 min | Native + ERC-20 wallet statement | Directional balances |
| 11 | [`block-by-timestamp`](11-py-block-by-timestamp) | Python | Starter | Seconds | Binary search with minimal block fields | Closest block |
| 12 | [`earliest-tx-multichain`](12-js-earliest-tx-multichain) | JavaScript | Advanced | 1–3 min | Bounded multichain concurrency | First activity per chain |
| 13 | [`stream-height`](13-js-stream-height) | JavaScript | Starter | Live | Height stream lifecycle | Tip updates |
| 14 | [`checkpointed-log-scan`](14-py-stream-logs-progress) | Python | Advanced | <1 min | Checkpoints + rollback guards | Durable progress file |
| 15 | [`stream-wallet`](15-rs-stream-wallet) | Rust | Builder | <1 min | Rust wallet filters + confirmed range | Batch metrics |
| 16 | [`decode-transfers`](16-js-stream-decode-transfers) | JavaScript | Starter | <1 min | Decoder + token units | Human-readable USDC |
| 17 | [`collect-parquet-usdc`](17-py-collect-parquet-usdc) | Python | Builder | <1 min | Confirmed snapshot to Parquet | Typed Parquet tables |
| 18 | [`native-eth-traces`](18-js-stream-native-eth-traces) | JavaScript | Advanced | <1 min | Internal calls, depth, and failures | ETH transfer table |
| 19 | [`stream-erc20-transfers`](19-rs-stream-erc20-transfers) | Rust | Starter | <1 min | Rust stream fundamentals | Batch metrics |
| 20 | [`preset-logs-of-event`](20-js-preset-logs-of-event) | JavaScript | Starter | Seconds | One-shot preset query | Transfer count |
| 21 | [`uniswap-swaps`](21-py-stream-uniswap-swaps) | Python | Advanced | <1 min | Manual ABI decoding + price math | Amounts and implied price |
| 22 | [`erc20-approvals`](22-js-stream-erc20-approvals) | JavaScript | Builder | <1 min | Approval decoding | Owner, spender, amount |
| 23 | [`tx-by-hash`](23-py-get-tx-by-hash) | Python | Starter | Seconds | Indexed hash lookup | Transaction summary |
| 24 | [`blocks-and-txs`](24-js-stream-blocks-and-txs) | JavaScript | Builder | Seconds | Blocks joined to transaction activity | Block activity table |
| 25 | [`contract-deployment-radar`](25-rs-contract-deployment-radar) | Rust | Advanced | <1 min | Receipt fields + contract creation | Deployment feed |
| 26 | [`join-transactions`](26-js-stream-join-transactions) | JavaScript | Builder | Seconds | `JoinNothing` vs default joins | Comparison + mappings |
| 27 | [`chainlink-feeds`](27-py-stream-chainlink-feeds) | Python | Advanced | <1 min | Indexed-topic decoding + oracle lag | Round and lag data |
| 28 | [`field-selection`](28-curl-blocks-field-selection) | curl | Starter | Seconds | Payload cost of broad fields | Byte comparison |
| 29 | [`multi-wallet-erc20`](29-js-stream-multi-wallet-erc20) | JavaScript | Builder | <1 min | OR filters across wallet topics | Per-wallet directions |
| 30 | [`stream-config-tuning`](30-py-stream-config-tuning) | Python | Advanced | 1–3 min | Reproducible default-vs-tuned benchmark | Throughput table |
| 31 | [`nft-mint-radar`](31-js-nft-mint-radar) | JavaScript | Builder | <1 min | Interface discovery + ERC-721 topic shape | Collection mint feed |
| 32 | [`stablecoin-supply-flows`](32-py-stablecoin-supply-flows) | Python | Builder | <1 min | Zero-address filters + exact supply math | Minted, burned, and net USDC |
| 33 | [`account-abstraction-ops`](33-js-account-abstraction-ops) | JavaScript | Advanced | <1 min | Multi-version decoding + paymaster analytics | User-operation summary |
| 34 | [`aave-liquidations`](34-js-aave-liquidations) | JavaScript | Advanced | <1 min | Protocol-scoped risk-event decoding | Liquidation dashboard |
| 35 | [`proxy-upgrade-monitor`](35-js-proxy-upgrade-monitor) | JavaScript | Builder | <1 min | Interface-wide security monitoring | Proxy implementation changes |
| 36 | [`governance-proposals`](36-js-governance-proposals) | JavaScript | Advanced | 1–3 min | Dynamic ABI arrays + proposal metadata | Cross-DAO proposal feed |
| 37 | [`op-bridge-deposits`](37-js-op-bridge-deposits) | JavaScript | Advanced | <1 min | Bridge events + opaque payloads | OP deposit feed |
| 38 | [`sandwich-candidates`](38-js-sandwich-candidates) | JavaScript | Advanced | <1 min | Joins + ordered MEV heuristics | Candidate transaction triples |
| 39 | [`ens-registrations`](39-js-ens-registrations) | JavaScript | Builder | <1 min | Dynamic strings + timestamp presentation | ENS registration feed |
| 40 | [`failed-transaction-hotspots`](40-js-failed-transaction-hotspots) | JavaScript | Builder | <1 min | Match-all transactions + failure grouping | Contract/selector hotspots |

Run times are rough and depend on the selected chain, range, connection, and rate limits. Defaults intentionally use bounded or confirmed ranges.

## Run conventions

### Python

```bash
cd 21-py-stream-uniswap-swaps
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Node.js / TypeScript

```bash
cd 16-js-stream-decode-transfers
npm install
npm start
```

### Rust

```bash
cd 19-rs-stream-erc20-transfers
cargo run --release
```

### curl

```bash
cd 28-curl-blocks-field-selection
./run.sh
```

## Safety model

- `to_block` is exclusive.
- `get()` returns one page. Continue from `next_block`; do not stop merely because a page has zero matches.
- Analytical streams default to a confirmed snapshot instead of the mutable chain tip.
- A stream is excellent for bounded historical work. For a durable live process, persist progress and account for reorgs; example 14 demonstrates the boundary-checking pieces.
- Token values stay integers until display. Converting `uint256` values to floating point can lose precision.
- Field selection is part of query design, not cosmetic output formatting. Request only what downstream code uses.

Read [Understanding `nextBlock`](https://docs.envio.dev/docs/HyperSync/hypersync-query) and [stream configuration](https://docs.envio.dev/docs/HyperSync/stream-config) before building a long-running pipeline.

## Repository checks

The CI workflow performs Python, JavaScript, shell, TypeScript, and Rust checks without needing an API token. Authenticated network smoke tests are intentionally separate so forks can run CI safely.

```bash
python -m compileall -q .
find . -name '*.js' -not -path '*/node_modules/*' -exec node --check {} \;
find . -name '*.sh' -exec bash -n {} \;
```

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Every example should be bounded, produce a useful answer, show expected output, and explain the HyperSync concept it exists to teach.

## Official resources

- [HyperSync overview](https://docs.envio.dev/docs/HyperSync/overview)
- [Query Builder](https://builder.hypersync.xyz)
- [Node client examples](https://github.com/enviodev/hypersync-client-node/tree/main/examples)
- [Python client examples](https://github.com/enviodev/hypersync-client-python/tree/main/examples)
- [Rust client examples](https://github.com/enviodev/hypersync-client-rust/tree/main/examples)
