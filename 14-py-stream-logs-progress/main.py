import asyncio
import json
import os
import time
from pathlib import Path

import hypersync
from hypersync import LogField, LogSelection


async def main():
    api_token = os.environ.get("ENVIO_API_TOKEN")
    if not api_token:
        raise SystemExit(
            "Missing ENVIO_API_TOKEN. https://docs.envio.dev/docs/HyperSync/api-tokens"
        )

    max_pages = int(os.environ.get("MAX_PAGES", "5"))
    confirmations = int(os.environ.get("CONFIRMATIONS", "20"))
    checkpoint_path = Path(os.environ.get("CHECKPOINT_FILE", ".checkpoint.json"))
    client = hypersync.HypersyncClient(
        hypersync.ClientConfig(
            url=os.environ.get("HYPERSYNC_URL", "https://eth.hypersync.xyz"),
            bearer_token=api_token,
        )
    )

    usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    transfer = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

    height = await client.get_height()
    safe_height = max(0, height - confirmations)
    checkpoint = load_checkpoint(checkpoint_path)
    current_block = int(checkpoint.get("next_block", max(0, safe_height - 2_000)))
    previous_guard_hash = checkpoint.get("guard_hash")
    total = int(checkpoint.get("total_logs", 0))

    if current_block >= safe_height:
        print(f"Already caught up to confirmed height {safe_height}.")
        return

    start = time.time()
    pages = 0

    while current_block < safe_height and pages < max_pages:
        query = hypersync.Query(
            from_block=current_block,
            to_block=safe_height,
            logs=[LogSelection(address=[usdt], topics=[[transfer]])],
            field_selection=hypersync.FieldSelection(
                log=[
                    LogField.ADDRESS,
                    LogField.TOPIC0,
                    LogField.DATA,
                    LogField.BLOCK_NUMBER,
                ]
            ),
        )
        res = await client.get(query)
        guard = res.rollback_guard

        if (
            previous_guard_hash
            and guard is not None
            and str(guard.first_parent_hash) != previous_guard_hash
        ):
            rewind_to = max(0, current_block - confirmations)
            print(
                f"Reorg detected before block {current_block}; rewinding to {rewind_to}. "
                "A real sink must also roll back rows from this range."
            )
            current_block = rewind_to
            previous_guard_hash = None
            total = 0
            save_checkpoint(
                checkpoint_path,
                {"next_block": current_block, "guard_hash": None, "total_logs": 0},
            )
            continue

        n = len(res.data.logs) if res.data and res.data.logs else 0
        total += n
        pages += 1
        if res.next_block <= current_block:
            raise RuntimeError("HyperSync did not advance next_block")
        current_block = res.next_block
        previous_guard_hash = str(guard.hash) if guard is not None else None
        save_checkpoint(
            checkpoint_path,
            {
                "next_block": current_block,
                "guard_hash": previous_guard_hash,
                "total_logs": total,
            },
        )
        elapsed = time.time() - start
        print(
            f"page={pages} next_block={res.next_block} logs_page={n} "
            f"total={total} elapsed={elapsed:.2f}s"
        )

    print(f"Checkpointed at block {current_block}. total_logs={total}")


def load_checkpoint(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text())


def save_checkpoint(path: Path, checkpoint: dict) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(checkpoint, indent=2) + "\n")
    temporary.replace(path)


asyncio.run(main())
