use anyhow::Result;
use hypersync_client::{
    net_types::{Query, TransactionField, TransactionFilter},
    Client, StreamConfig,
};
use std::env;

#[tokio::main]
async fn main() -> Result<()> {
    let api_token = env::var("ENVIO_API_TOKEN")?;
    let max_deployments: usize = env::var("MAX_DEPLOYMENTS")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(10);
    let hypersync_url =
        env::var("HYPERSYNC_URL").unwrap_or_else(|_| "https://eth.hypersync.xyz".into());

    let client = Client::builder()
        .url(hypersync_url)
        .api_token(api_token)
        .build()?;

    let height = client.get_height().await?;
    let safe_height = height.saturating_sub(12);
    let from_block = safe_height.saturating_sub(100);
    let query = Query::new()
        .from_block(from_block)
        .to_block_excl(safe_height)
        .where_transactions(TransactionFilter::all())
        .select_transaction_fields([
            TransactionField::BlockNumber,
            TransactionField::Hash,
            TransactionField::From,
            TransactionField::ContractAddress,
            TransactionField::GasUsed,
            TransactionField::Status,
        ]);

    let mut receiver = client.stream(query, StreamConfig::default()).await?;
    let mut found = 0usize;

    while found < max_deployments {
        match receiver.recv().await {
            Some(Ok(response)) => {
                for transaction in response.data.transactions.into_iter().flatten() {
                    let Some(contract) = transaction.contract_address else {
                        continue;
                    };
                    println!(
                        "block={:?} contract={} deployer={:?} tx={:?} gas_used={:?} status={:?}",
                        transaction.block_number,
                        contract,
                        transaction.from,
                        transaction.hash,
                        transaction.gas_used,
                        transaction.status,
                    );
                    found += 1;
                    if found >= max_deployments {
                        break;
                    }
                }
            }
            Some(Err(error)) => return Err(error.into()),
            None => break,
        }
    }

    println!("Done. deployments={found}");
    Ok(())
}
