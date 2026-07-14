# 06 — Discover and decode Uniswap V3 pools (JavaScript)

Stream `PoolCreated` events from the canonical Uniswap V3 factory and print token pair, fee tier, tick spacing, and pool address.

**Concepts:** topic hashing, contract scoping, `Decoder`, early stream shutdown.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected shape:

```text
{ block: ..., token0: '0x...', token1: '0x...', fee: '3000', pool: '0x...' }
Done. decoded_pools=10
```

Try `MAX_POOLS`, `FROM_BLOCK`, or `HYPERSYNC_URL`.

Production note: close a stream when stopping before its bounded range is exhausted; the example uses `finally`.
