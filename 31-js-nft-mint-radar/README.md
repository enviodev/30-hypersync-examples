# 31 — NFT mint radar (JavaScript)

Find recent ERC-721 mints across Ethereum and print collection, recipient, token ID, and transaction.

**Concepts:** interface-level event discovery, indexed-address filters, ERC-20 versus ERC-721 disambiguation.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output is a table of newly minted NFTs. Try `BLOCK_WINDOW`, `MAX_RESULTS`, or `HYPERSYNC_URL`.

Production note: ERC-721 and ERC-20 share the same `Transfer` topic. This example requires a fourth topic—the indexed token ID—to avoid classifying ERC-20 supply mints as NFTs.
