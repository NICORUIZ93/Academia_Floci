// Recibe (hasta 10) mensajes de una cola SQS sin eliminarlos todavia.
// Uso: cargo run --bin sqs_receive_message -- <queue-url>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_sqs::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_sqs::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("Uso: cargo run --bin sqs_receive_message -- <queue-url>");
        std::process::exit(1);
    }
    let queue_url = &args[1];

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let result = client
        .receive_message()
        .queue_url(queue_url)
        .max_number_of_messages(10)
        .wait_time_seconds(2)
        .send()
        .await?;

    let messages = result.messages();
    if messages.is_empty() {
        println!("No hay mensajes disponibles ahora mismo.");
        return Ok(());
    }
    println!("{} mensaje(s) recibido(s):", messages.len());
    for msg in messages {
        let handle = msg.receipt_handle().unwrap_or("");
        let preview = if handle.len() > 20 { &handle[..20] } else { handle };
        println!("  - {} (ReceiptHandle: {preview}...)", msg.body().unwrap_or(""));
    }
    println!("\nUsa sqs_delete_message.rs con el ReceiptHandle completo para confirmarlos.");
    Ok(())
}
