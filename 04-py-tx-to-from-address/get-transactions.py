import asyncio
import os
import time

import hypersync
from hypersync import TransactionField

WALLET_ADDRESS = os.environ.get(
    "WALLET_ADDRESS", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
).lower()


async def main():
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
        )

    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(
            url=os.environ.get("HYPERSYNC_URL", "https://base.hypersync.xyz"),
            bearer_token=api_token,
        )
    )
    height = await client.get_height()
    confirmations = int(os.environ.get("CONFIRMATIONS", "12"))
    to_block = max(0, height - confirmations)

    # The query to run
    query = hypersync.Query(
        from_block=int(os.environ.get("FROM_BLOCK", "0")),
        to_block=to_block,
        logs=[],
        transactions=[
            # get all transactions coming from and going to any of our addresses.
            hypersync.TransactionSelection(from_=[WALLET_ADDRESS]),
            hypersync.TransactionSelection(to=[WALLET_ADDRESS]),
        ],
        field_selection=hypersync.FieldSelection(
            transaction=[
                TransactionField.HASH,
                TransactionField.BLOCK_NUMBER,
                TransactionField.FROM,
                TransactionField.TO,
                TransactionField.VALUE,
                TransactionField.INPUT,
            ]
        )
    )

    print(f"Scanning [{query.from_block}, {to_block}) for {WALLET_ADDRESS}...")
    started = time.perf_counter()
    receiver = await client.stream(query, hypersync.StreamConfig())
    total = 0
    samples = []
    while True:
        res = await receiver.recv()
        if res is None:
            break
        total += len(res.data.transactions)
        samples.extend(res.data.transactions[: max(0, 3 - len(samples))])
        print(f"next_block={res.next_block} batch={len(res.data.transactions)} total={total}")

    print(f"Done in {time.perf_counter() - started:.2f}s. transactions={total}")
    for tx in samples:
        print(
            f"sample block={tx.block_number} hash={tx.hash} "
            f"from={tx.from_} to={tx.to} value_wei={tx.value}"
        )

asyncio.run(main())
