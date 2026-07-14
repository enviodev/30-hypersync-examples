# 16 — Stream + decode ERC-20 Transfers (JS)

Stream USDC Transfer logs and decode them with `Decoder`.

**Concepts:** event decoder, indexed parameters, token decimal formatting, early close.

```bash
export ENVIO_API_TOKEN=...
npm install
npm start
```

Expected output prints `USDC from -> to amount=...`. Try `MAX_EVENTS` or `CONFIRMATIONS`.
