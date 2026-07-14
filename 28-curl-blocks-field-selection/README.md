# 28 — curl query with field selection

Run minimal and broad block queries over the same range, then compare response sizes and inspect the minimal record.

**Concepts:** raw `/query`, field selection, payload measurement.

```bash
export ENVIO_API_TOKEN=...
./run.sh
```

Expected output reports bytes for both responses. Try `FROM_BLOCK`, `TO_BLOCK`, or `HYPERSYNC_URL`. `jq` is optional.
