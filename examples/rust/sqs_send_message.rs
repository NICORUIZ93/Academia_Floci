// Envia un mensaje a una cola SQS.
// Uso: cargo run --bin sqs_send_message -- <queue-url> <texto-del-mensaje>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_sqs::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_sqs::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin sqs_send_message -- <queue-url> <texto-del-mensaje>");
        std::process::exit(1);
    }
    let queue_url = &args[1];
    let body = args[2..].join(" ");

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let result = client.send_message().queue_url(queue_url).message_body(&body).send().await?;
    println!("Mensaje enviado. MessageId: {}", result.message_id().unwrap_or("?"));
    Ok(())
}
