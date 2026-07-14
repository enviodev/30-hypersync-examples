import asyncio
import os

import hypersync


async def main():
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
        )

    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(
            url=os.environ.get("HYPERSYNC_URL", "https://eth.hypersync.xyz"),
            bearer_token=api_token,
        )
    )

    contract = os.environ.get(
        "CONTRACT_ADDRESS", "0xD92145c07f8Ed1D392c1B88017934E301CC1c3Cd"
    )
    from_block = int(os.environ.get("FROM_BLOCK", "0"))
    to_block = int(os.environ.get("TO_BLOCK", "19670000"))
    query = hypersync.preset_query_logs(contract, from_block, to_block)

    total = 0
    pages = 0
    while query.from_block < to_block:
        res = await client.get(query)
        pages += 1
        total += len(res.data.logs)
        print(
            f"page={pages} range=[{query.from_block}, {res.next_block}) "
            f"logs={len(res.data.logs)} total={total}"
        )

        if res.next_block <= query.from_block:
            raise RuntimeError("HyperSync did not advance next_block")
        query.from_block = res.next_block

    print(f"Done. Retrieved {total} logs from {contract} across {pages} page(s).")


asyncio.run(main())
