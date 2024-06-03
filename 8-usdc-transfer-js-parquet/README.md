### Hypersync Client Script for Ethereum Event Logs

This script uses the Hypersync Client to fetch Ethereum transfer events from USDT in a certain block range and store decoded values to parquet.

It may be useful to use a parquet file viewing tool such as the vscode plugin

#### Prerequisites

- Node.js installed on your machine

#### Installation and Usage

1. **Install necessary dependencies:**

   ```sh
   npm install
   ```

2. **Run the script:**
   ```sh
   node usdc-transfer-parquet.js
   ```
