import pyarrow.parquet as pq

def main():
    file_path = "data/logs.parquet"
    batch_size = 1000000  # Number of rows to read at a time
    num_entries = 0

    parquet_file = pq.ParquetFile(file_path)
    
    # Iterating through the file in batches
    for batch in parquet_file.iter_batches(batch_size):
        num_entries += len(batch)

    print(f"The logs parquet file contains {num_entries} entries.")

if __name__ == "__main__":
    main()
