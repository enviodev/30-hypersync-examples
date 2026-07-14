# Contributing an example

An example should teach one clear HyperSync idea and finish with an output a developer would actually want.

## Checklist

- Use `NN-lang-short-slug` naming.
- Read `ENVIO_API_TOKEN` from the environment and fail with a useful message.
- Make the endpoint, important addresses, and ranges configurable where practical.
- Bound historical examples with `to_block`/`toBlock`.
- Use `next_block`/`nextBlock` for pagination; never treat an empty result page as proof that the scan reached its end.
- Keep token and wei values as integers until presentation.
- Select only fields the code uses.
- Close Node stream handles in `finally` when exiting early.
- Do not commit `node_modules`, virtual environments, build output, checkpoints, or generated datasets.
- Include a README with the sections below.

## README shape

1. **Outcome** — one sentence describing what the user will build.
2. **Concepts** — the two or three HyperSync ideas demonstrated.
3. **Run** — copy-paste commands from a clean checkout.
4. **Expected output** — a short representative sample.
5. **Try it** — two safe parameters the reader can change.
6. **Production note** — any precision, pagination, reorg, or scale caveat.

## Verification

Run language checks locally. Network examples should use small defaults so a maintainer can smoke-test them with a normal API token.
