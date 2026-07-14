# 35 — Proxy upgrade monitor (JavaScript)

Discover recent ERC-1967 `Upgraded` events across Ethereum and identify proxy-to-implementation changes.

**Concepts:** interface-level monitoring, indexed implementation decoding, security observability.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output lists proxy, new implementation, block, and transaction. Try `BLOCK_WINDOW`, `MAX_RESULTS`, or add an address filter for contracts you operate.

Production note: an `Upgraded` event is a signal, not proof that an upgrade is safe. Monitor admin changes, bytecode, governance authorization, and implementation storage compatibility separately.
