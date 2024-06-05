use std::{num::NonZeroU64, time::Instant};

use hyperfuel_client::{Client, Config};
use hyperfuel_net_types::Query;
use url::Url;

#[tokio::main]
async fn main() {
    let client_config = Config {
        url: Url::parse("https://fuel-testnet.hypersync.xyz").unwrap(),
        bearer_token: None,
        http_req_timeout_millis: NonZeroU64::new(30000).unwrap(),
    };
    let client = Client::new(client_config).unwrap();

    let height = client.get_height().await.unwrap();
    println!("Current height: {}", height);

    let query: Query = serde_json::from_value(serde_json::json!({
        // start at block 0
        "from_block": 0,
        // empty receipt selection means we're not looking for any data in particular
        "receipts": [{}],
        // load all the blocks, even if they don't match our selection (empty receipt selection)
        "include_all_blocks": true,
        // the fields we want returned from the blocks that are loaded
        "field_selection": {
            /*
            A NOTE ON THE FIELDS USED IN HYPERSYNC
                Fuel schema uses a lot of nested structures that are difficult to mirror
                elegantly in our backend (using arrow2 - it does have support for
                arrow structs but would complicate the rest of our query engine).
                For simplicity, we 'flatten' the fields of these structs into our schema.

                For example, Fuel transactions contain a Policy struct:

                In Fuel schema:

                    Transaction {
                        Policies {
                            tip
                            witnessLimit
                            maturity
                            maxFee
                        }
                        ... other fields
                    }

                In our schema:

                    Transaction {
                        policies_tip
                        policies_witness_limit
                        policies_maturity
                        policies_max_fee
                        ... other fields
                    }
             */
            // return all the fields of the loaded transactions
            "transaction": [
                "block_height",
                "id",
                "input_asset_ids",
                "input_contracts",
                "input_contract_utxo_id",
                "input_contract_balance_root",
                "input_contract_state_root",
                "input_contract_tx_pointer_block_height",
                "input_contract_tx_pointer_tx_index",
                "input_contract",
                "policies_tip",
                "policies_witness_limit",
                "policies_maturity",
                "policies_max_fee",
                "script_gas_limit",
                "maturity",
                "mint_amount",
                "mint_asset_id",
                "mint_gas_price",
                "tx_pointer_block_height",
                "tx_pointer_tx_index",
                "tx_type",
                "output_contract_input_index",
                "output_contract_balance_root",
                "output_contract_state_root",
                "witnesses",
                "receipts_root",
                "status",
                "time",
                "reason",
                "script",
                "script_data",
                "bytecode_witness_index",
                "bytecode_root",
                "subsection_index",
                "subsections_number",
                "proof_set",
                "consensus_parameters_upgrade_purpose_witness_index",
                "consensus_parameters_upgrade_purpose_checksum",
                "state_transition_upgrade_purpose_root",
                "salt",
            ]
        }
    }))
    .unwrap();

    let start_time = Instant::now();

    // `create_parquet_folder` automatically paginates internally
    client
        .create_parquet_folder(query, "data".into())
        .await
        .unwrap();

    let end_time = Instant::now();
    println!(
        "Got all transactions in {} blocks in {}ms",
        height,
        (end_time - start_time).as_secs()
    );
}
