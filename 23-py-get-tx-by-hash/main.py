import asyncio
import os

import hypersync
from hypersync import JoinMode, TransactionField, TransactionSelection


async def main():
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens"
        )

    tx_hash = os.environ.get(
        "TX_HASH",
        "0x410eec15e380c6f23c2294ad714487b2300dd88a7eaa051835e0da07f16fc282",
    )

    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(url="https://eth.hypersync.xyz", bearer_token=api_token)
    )

    query = hypersync.Query(
        from_block=0,
        join_mode=JoinMode.JOIN_NOTHING,
        field_selection=hypersync.FieldSelection(
            transaction=[
                TransactionField.BLOCK_NUMBER,
                TransactionField.HASH,
                TransactionField.FROM,
                TransactionField.TO,
                TransactionField.VALUE,
            ]
        ),
        transactions=[TransactionSelection(hash=[tx_hash])],
    )

    res = await client.get(query)
    if not res.data.transactions:
        print("No transaction found")
        return
    tx = res.data.transactions[0]
    print(
        f"hash={tx.hash} block={tx.block_number} from={tx.from_} to={tx.to} value={tx.value}"
    )


asyncio.run(main())
