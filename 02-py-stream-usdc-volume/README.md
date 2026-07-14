# 02 — Exact USDC volume with Parquet + Polars (Python)

Collect decoded USDC transfers to Parquet, then calculate total and average transfer volume with Polars.

**Concepts:** log filters, decoded Parquet output, integer-safe token analytics.

```bash
pip install -r requirements.txt
export ENVIO_API_TOKEN=...
python usdc-volume.py
python calculate-volume.py
```

Expected output includes row count, exact raw integer total, USDC total, and average transfer size.

Try changing the block range or contract address. If you switch tokens, update both the event decimals and the output label.

Production note: token `uint256` values must not be converted to `Float64`; this example keeps them as `UInt64` because USDC supply fits that range.
