# 32 — Stablecoin supply flows (Python)

Measure USDC minted, burned, and net supply change over a confirmed Ethereum window.

**Concepts:** OR selections, zero-address topics, exact integer aggregation.

```bash
pip install -r requirements.txt
export ENVIO_API_TOKEN=...
python main.py
```

Expected output reports mint count, burn count, and exact human-formatted USDC totals. Try `BLOCK_WINDOW` or `HYPERSYNC_URL`.

Production note: this is onchain token supply flow, not a measure of issuer reserves or cross-chain circulating supply.
