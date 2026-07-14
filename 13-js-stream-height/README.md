# 13 — Stream chain height (JS)

Watch tip height updates with `streamHeight()`.

**Concepts:** height-stream lifecycle, connection events, graceful close.

```bash
export ENVIO_API_TOKEN=...
npm install
npm start
```

Expected output includes `Connected`, three `Height` events, then `Done`. Try `MAX_HEIGHT_EVENTS` or set `HYPERSYNC_URL` to another network endpoint.

Height events are notifications, not durable data processing checkpoints.

Docs: [HyperSync clients](https://docs.envio.dev/docs/HyperSync/hypersync-clients)
