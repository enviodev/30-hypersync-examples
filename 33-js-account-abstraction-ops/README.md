# 33 — Account-abstraction operations (JavaScript)

Analyze recent ERC-4337 `UserOperationEvent` logs across the official EntryPoint versions.

**Concepts:** multiple contract versions, ABI decoding, success and paymaster aggregation.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output lists smart-account senders, success, gas, and sponsorship status. Try `BLOCK_WINDOW`, `MAX_RESULTS`, or another EntryPoint list.

Production note: EntryPoint versions are deliberately explicit. Verify new deployment addresses against the official account-abstraction releases before adding them.
