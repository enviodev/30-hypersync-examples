use anyhow::Result;
use hypersync_client::{
    net_types::{LogField, LogFilter, Query, TransactionField, TransactionFilter},
    Client, StreamConfig,
};
use std::env;

fn address_to_topic(address: &str) -> String {
    format!("0x000000000000000000000000{}", &address[2..])
}

#[tokio::main]
async fn main() -> Result<()> {
    let api_token = env::var("ENVIO_API_TOKEN")?;
    let max_batches: usize = env::var("MAX_BATCHES")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3);

    let client = Client::builder()
        .url("https://eth.hypersync.xyz")
        .api_token(api_token)
        .build()?;

    let address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // vitalik.eth
    let topic = address_to_topic(address);
    let transfer = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    let height = client.get_height().await?;
    let from_block = height.saturating_sub(5_000);

    let query = Query::new()
        .from_block(from_block)
        .where_logs(
            LogFilter::all()
                .and_topic0([transfer])?
                .and_topic1([topic.clone()])?
                .or(LogFilter::all()
                    .and_topic0([transfer])?
                    .and_topic2([topic])?),
        )
        .where_transactions(
            TransactionFilter::all()
                .and_from([address])?
                .or(TransactionFilter::all().and_to([address])?),
        )
        .select_log_fields([
            LogField::Address,
            LogField::Topic0,
            LogField::Topic1,
            LogField::Topic2,
            LogField::Data,
        ])
        .select_transaction_fields([
            TransactionField::Hash,
            TransactionField::From,
            TransactionField::To,
            TransactionField::Value,
        ]);

    let mut receiver = client.stream(query, StreamConfig::default()).await?;
    let mut batches = 0usize;

    while batches < max_batches {
        match receiver.recv().await {
            Some(Ok(res)) => {
                let logs = res.data.logs.len();
                let txs = res.data.transactions.len();
                println!(
                    "batch={} next_block={} logs={} txs={}",
                    batches + 1,
                    res.next_block,
                    logs,
                    txs
                );
                batches += 1;
            }
            Some(Err(e)) => return Err(e.into()),
            None => break,
        }
    }

    println!("Done after {batches} batches");
    Ok(())
}
