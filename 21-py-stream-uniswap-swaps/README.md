# 21 — Stream Uniswap V3 Swap events (Python)

Decode recent USDC/WETH Uniswap V3 swaps and print signed token amounts, implied USD/WETH price, tick, and liquidity.

**Concepts:** manual ABI word decoding, signed integers, fixed-point price math, pool scoping.

```bash
export ENVIO_API_TOKEN=...
pip install -r requirements.txt
python main.py
```

Expected output contains one human-readable line per swap. Try `MAX_SWAPS`, `BLOCK_WINDOW`, or another pool with the correct token decimals.

The displayed price assumes token0 is 6-decimal USDC and token1 is 18-decimal WETH for the configured pool.
