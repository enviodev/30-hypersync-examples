use anyhow::Result;
use hypersync_client::{Client, HeightStreamEvent};
use std::env;

#[tokio::main]
async fn main() -> Result<()> {
    let api_token = env::var("ENVIO_API_TOKEN")?;
    let max_events: usize = env::var("MAX_HEIGHT_EVENTS")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3);

    let client = Client::builder()
        .url("https://eth.hypersync.xyz")
        .api_token(api_token)
        .build()?;

    let mut rx = client.stream_height();
    let mut seen = 0usize;

    while seen < max_events {
        match rx.recv().await {
            Some(HeightStreamEvent::Connected) => println!("Connected"),
            Some(HeightStreamEvent::Height(height)) => {
                println!("Height: {height}");
                seen += 1;
            }
            Some(HeightStreamEvent::Reconnecting { delay, error_msg }) => {
                println!("Reconnecting in {delay:?}: {error_msg}");
            }
            None => break,
        }
    }

    println!("Done after {seen} height events");
    Ok(())
}
