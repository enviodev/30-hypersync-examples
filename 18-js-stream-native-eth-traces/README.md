# 18 — Stream native ETH transfers via traces (JS)

Query the traces endpoint for `call` traces with non-zero value.

**Concepts:** internal calls, trace depth, failed calls, native-value formatting.

```bash
export ENVIO_API_TOKEN=...
npm install
npm start
```

Uses `https://eth-traces.hypersync.xyz`.

Expected output is a table with sender, recipient, ETH/wei value, depth, transaction, and error. Try `MAX_RESULTS` or `THRESHOLD_WEI` in the script.
