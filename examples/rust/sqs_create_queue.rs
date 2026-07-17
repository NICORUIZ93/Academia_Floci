// Crea una cola SQS en Floci.
// Requiere crates: aws-config, aws-sdk-sqs, aws-credential-types, tokio.
// Uso: cargo run --bin sqs_create_queue -- [nombre-de-cola]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_sqs::{config::Region, Client, Config};
use std::time::{SystemTime, UNIX_EPOCH};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_sqs::Error> {
    let args: Vec<String> = std::env::args().collect();
    let queue_name = args.get(1).cloned().unwrap_or_else(|| {
        let millis = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
        format!("mi-cola-{millis}")
    });

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let result = client.create_queue().queue_name(&queue_name).send().await?;
    println!("Cola creada: {queue_name}");
    println!("URL: {}", result.queue_url().unwrap_or("?"));
    Ok(())
}
