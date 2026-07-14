import polars as pl

# Load the data from the Parquet file
df = pl.read_parquet("data/decoded_logs.parquet")

# Aggregate count and exact integer volume before formatting token units.
top_addresses = (
    df.group_by("from")
    .agg(
        pl.len().alias("transfer_count"),
        pl.col("value").sum().alias("raw_volume"),
    )
    .sort("raw_volume", descending=True)
    .head(10)
    .with_columns((pl.col("raw_volume") / 10**6).alias("usdt_volume"))
)

# Adjust this value based on your longest string
pl.Config.set_fmt_str_lengths(128)

# Print the top 10 addresses with their transfer counts
print("Top 10 senders by exact USDT volume:")
print(top_addresses)
