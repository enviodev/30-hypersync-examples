import polars as pl

def main():
     # Read the parquet file
    df = pl.read_parquet("data/decoded_logs.parquet")

     # Calculate the sum of the "value" column
    total_value = df["value"].sum()

     # Divide 10^6 to get the value in dollars
    dollars_value = total_value / 10**6

     # Get the number of entries (rows) in the Parquet file
    num_entries = len(df)

     # Calculate average USD/C value per transfer
    avg_usdc_per_transfer = dollars_value / num_entries

    print(f"The decoded logs parquet file contains {num_entries} entries.")
    print(f"The sum of all 'value' column values is: {total_value}")
    print(f"Converting this to dollars, we get: {dollars_value}")
    print(f"Avg USDC value per transfer: {avg_usdc_per_transfer}")

if __name__ == "__main__":
    main()