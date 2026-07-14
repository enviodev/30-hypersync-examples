# 39 — ENS registration feed (JavaScript)

Decode recent `.eth` registrations into name, owner, price, expiry, and transaction.

**Concepts:** dynamic string decoding, indexed labels and owners, timestamp presentation.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output is a human-readable ENS registration table. Try `BLOCK_WINDOW`, `MAX_RESULTS`, or set `CONTROLLER_ADDRESS` to scope the query to one registrar controller.

Production note: interface-level discovery naturally spans controller generations, but signature matches alone do not prove a contract is an official ENS controller. In production, validate discovered addresses against an allowlist or the ENS deployment registry.
