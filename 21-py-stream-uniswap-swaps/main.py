import asyncio
import os
from decimal import Decimal, getcontext

import hypersync
from hypersync import LogField, LogSelection


SWAP_TOPIC = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"
USDC_WETH_POOL = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
getcontext().prec = 50


async def main():
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens"
        )

    max_swaps = int(os.environ.get("MAX_SWAPS", "10"))
    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(
            url=os.environ.get("HYPERSYNC_URL", "https://eth.hypersync.xyz"),
            bearer_token=api_token,
        )
    )
    height = await client.get_height()
    safe_height = max(0, height - int(os.environ.get("CONFIRMATIONS", "12")))
    from_block = max(0, safe_height - int(os.environ.get("BLOCK_WINDOW", "5000")))

    query = hypersync.Query(
        from_block=from_block,
        to_block=safe_height,
        logs=[LogSelection(address=[USDC_WETH_POOL], topics=[[SWAP_TOPIC]])],
        field_selection=hypersync.FieldSelection(
            log=[
                LogField.ADDRESS,
                LogField.TOPIC0,
                LogField.TOPIC1,
                LogField.TOPIC2,
                LogField.DATA,
                LogField.BLOCK_NUMBER,
                LogField.TRANSACTION_HASH,
            ]
        ),
    )

    receiver = await client.stream(query, hypersync.StreamConfig())
    total = 0
    while total < max_swaps:
        res = await receiver.recv()
        if res is None:
            break
        for log in res.data.logs:
            swap = decode_swap(log.data)
            if swap is None:
                continue
            amount0, amount1, sqrt_price_x96, liquidity, tick = swap
            raw_token1_per_token0 = Decimal(sqrt_price_x96**2) / Decimal(2**192)
            weth_per_usdc = raw_token1_per_token0 * Decimal(10**6) / Decimal(10**18)
            usd_per_weth = Decimal(1) / weth_per_usdc if weth_per_usdc else Decimal(0)
            print(
                f"block={log.block_number} tx={log.transaction_hash} "
                f"usdc={Decimal(amount0) / Decimal(10**6):,.2f} "
                f"weth={Decimal(amount1) / Decimal(10**18):,.6f} "
                f"price=${usd_per_weth:,.2f} tick={tick} liquidity={liquidity}"
            )
            total += 1
            if total >= max_swaps:
                break

    print(f"Done. decoded_swaps={total}")


def decode_swap(data: str | None):
    if not data:
        return None
    payload = data.removeprefix("0x")
    if len(payload) < 64 * 5:
        return None
    words = [int(payload[index : index + 64], 16) for index in range(0, 64 * 5, 64)]
    amount0 = to_signed(words[0])
    amount1 = to_signed(words[1])
    tick = to_signed(words[4])
    return amount0, amount1, words[2], words[3], tick


def to_signed(value: int) -> int:
    return value - 2**256 if value >= 2**255 else value


asyncio.run(main())
