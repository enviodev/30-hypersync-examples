# 10 — Native and ERC-20 wallet statement (TypeScript)

Build a confirmed wallet activity statement containing direct native transfers and ERC-20 transfers grouped by token contract.

**Concepts:** mixed transaction/log selections, `JoinNothing`, decoding, directional aggregation.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start -- 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Expected output includes native ETH in/out counts and values plus raw ERC-20 in/out/net values per token contract.

Adjust `erc20InThreshold` and `erc20OutThreshold` in `src/config.ts`, or set `FROM_BLOCK`, `CONFIRMATIONS`, or `HYPERSYNC_URL`.

Production note: ERC-20 values are deliberately labelled raw units because token decimals differ. Enrich token metadata via a trusted token list or contract calls before displaying human units.
