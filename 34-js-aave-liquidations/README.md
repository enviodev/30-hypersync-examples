# 34 — Aave V3 liquidation dashboard (JavaScript)

Decode recent Ethereum Aave V3 liquidations into borrower, assets, liquidator, and seized amounts.

**Concepts:** protocol address scoping, mixed indexed/body fields, risk-event analytics.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output is a liquidation table. Try `BLOCK_WINDOW`, `MAX_RESULTS`, or another Aave market endpoint and pool address.

Production note: amount columns remain raw token units because collateral and debt assets have different decimals. Enrich token metadata before displaying fiat values.
