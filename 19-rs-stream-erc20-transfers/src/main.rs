use anyhow::Result;
use hypersync_client::{
    net_types::{LogField, LogFilter, Query},
    Client, StreamConfig,
};
use std::env;

#[tokio::main]
async fn main() -> Result<()> {
    let api_token = env::var("ENVIO_API_TOKEN")?;
    let max_batches: usize = env::var("MAX_BATCHES")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3);

    let client = Client::builder()
        .chain_id(1)
        .api_token(api_token)
        .build()?;

    let usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    let transfer = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    let height = client.get_height().await?;
    let from_block = height.saturating_sub(1_000);

    let query = Query::new()
        .from_block(from_block)
        .where_logs(
            LogFilter::all()
                .and_address([usdt])?
                .and_topic0([transfer])?,
        )
        .select_log_fields([
            LogField::Address,
            LogField::Topic0,
            LogField::Topic1,
            LogField::Topic2,
            LogField::Data,
            LogField::BlockNumber,
        ]);

    let mut receiver = client.stream(query, StreamConfig::default()).await?;
    let mut batches = 0usize;
    let mut total = 0usize;

    while batches < max_batches {
        match receiver.recv().await {
            Some(Ok(res)) => {
                let n = res.data.logs.len();
                total += n;
                println!(
                    "batch={} next_block={} logs={} total={}",
                    batches + 1,
                    res.next_block,
                    n,
                    total
                );
                batches += 1;
            }
            Some(Err(e)) => return Err(e.into()),
            None => break,
        }
    }

    println!("Done. total_logs={total}");
    Ok(())
}
