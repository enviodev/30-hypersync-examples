# 29 — Multi-wallet ERC-20 stream (JS)

Stream ERC-20 Transfers where `from` or `to` matches any of several wallets (topic OR).

**Concepts:** topic encoding, OR selections, multi-wallet aggregation.

```bash
export ENVIO_API_TOKEN=...
npm install
npm start
```

Expected output reports batch progress followed by inbound/outbound transfer counts per wallet. Try the wallet list or block window.
