import hypersync
import asyncio
import time
from datetime import datetime, timezone
import os


async def get_block_at_timestamp(client, target_timestamp: int) -> int:
    # Binary search variables
    left = 0
    right = await client.get_height()
    closest_block = 0
    smallest_diff = float('inf')

    while left <= right:
        mid = (left + right) // 2
        # Query specifically for just this one block
        query = hypersync.Query(
            from_block=mid,
            to_block=mid + 1,  # Exclusive upper bound
            include_all_blocks=True,
            field_selection=hypersync.FieldSelection(
                block=[hypersync.BlockField.TIMESTAMP]
            ),
        )

        res = await client.get(query)

        if not res.data.blocks:
            right = mid - 1
            continue

        # Timestamp may be returned as hex string or int depending on client version
        raw_ts = res.data.blocks[0].timestamp
        block_timestamp = int(raw_ts, 16) if isinstance(raw_ts, str) else int(raw_ts)

        # Calculate the difference from our target
        diff = abs(block_timestamp - target_timestamp)

        # Update closest block if this is the best match so far
        if diff < smallest_diff:
            smallest_diff = diff
            closest_block = mid

        # Adjust our search range
        if block_timestamp < target_timestamp:
            left = mid + 1
        else:
            right = mid - 1

        checked_at = datetime.fromtimestamp(block_timestamp, tz=timezone.utc)
        print(f"Checking block {mid:,}: {checked_at.isoformat()}")

    return closest_block


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

    target_iso = os.environ.get("TARGET_TIME", "2024-01-01T00:00:00+00:00")
    target = datetime.fromisoformat(target_iso.replace("Z", "+00:00"))
    if target.tzinfo is None:
        target = target.replace(tzinfo=timezone.utc)
    target_timestamp = int(target.timestamp())

    print(f"Searching for block closest to {target.astimezone(timezone.utc).isoformat()}")
    started = time.perf_counter()
    block = await get_block_at_timestamp(client, target_timestamp)
    print(f"Found block {block:,} in {time.perf_counter() - started:.2f}s")

if __name__ == "__main__":
    asyncio.run(main())
