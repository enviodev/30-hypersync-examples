# 36 — Governance proposal discovery (JavaScript)

Discover and decode OpenZeppelin-compatible Governor proposals across Ethereum.

**Concepts:** interface-level discovery, dynamic ABI arrays, human-readable proposal metadata.

```bash
npm install
export ENVIO_API_TOKEN=...
npm start
```

Expected output lists governor, proposer, action count, voting window, and description. Try `BLOCK_WINDOW`, `MAX_RESULTS`, or add an address filter for a specific DAO.

Production note: proposal creation is only the beginning of the lifecycle. Join `VoteCast`, `ProposalQueued`, `ProposalExecuted`, and `ProposalCanceled` when building governance state.
