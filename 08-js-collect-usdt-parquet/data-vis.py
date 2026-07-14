import polars as pl

# Load the data from the Parquet file
df = pl.read_parquet("data/decoded_logs.parquet")

# Aggregate the data to find the frequency of each "from" address
frequency = df.group_by("from").agg(pl.len().alias("transfer_count"))

# Sort the data by frequency in descending order by first sorting ascending, then reversing
sorted_frequency = frequency.sort("transfer_count").reverse()

top_addresses = sorted_frequency.head(10)

# Adjust this value based on your longest string
pl.Config.set_fmt_str_lengths(128)

# Print the top 10 addresses with their transfer counts
print("Top 10 Addresses by Transfer Count:")
print(top_addresses)
