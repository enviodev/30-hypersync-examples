import hypersync
import asyncio
import time
from datetime import datetime
import os


async def get_block_at_timestamp(target_timestamp: int) -> int:
    # Create hypersync client using the mainnet hypersync endpoint
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. Get a token at https://docs.envio.dev/docs/HyperSync/api-tokens and export it before running."
        )

    client = hypersync.HypersyncClient(hypersync.ClientConfig(
        url="https://eth.hypersync.xyz",
        bearer_token=api_token
    ))

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

        print(f"Checking block {mid}, timestamp: {
              datetime.fromtimestamp(block_timestamp)}")

    return closest_block


async def main():
    # Example: Find block at January 1, 2024 00:00:00 UTC
    target_timestamp = int(datetime(2024, 1, 1).timestamp())

    print(f"Searching for block at timestamp: {
          datetime.fromtimestamp(target_timestamp)}")
    block = await get_block_at_timestamp(target_timestamp)
    print(f"Found closest block: {block}")

if __name__ == "__main__":
    asyncio.run(main())
