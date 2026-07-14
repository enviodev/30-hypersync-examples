import polars as pl


def main():
    # Keep token values as integers until presentation to avoid precision loss.
    df = pl.read_parquet("data/decoded_logs.parquet")
    total_raw = int(df["value"].sum() or 0)
    num_entries = len(df)
    total_usdc = total_raw / 10**6
    average_usdc = total_usdc / num_entries if num_entries else 0

    print(f"The decoded logs parquet file contains {num_entries} entries.")
    print(f"Raw integer total: {total_raw}")
    print(f"USDC transferred: {total_usdc:,.2f}")
    print(f"Average USDC per transfer: {average_usdc:,.2f}")


if __name__ == "__main__":
    main()
