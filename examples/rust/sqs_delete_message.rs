// Elimina (confirma el procesamiento de) un mensaje de una cola SQS.
// Uso: cargo run --bin sqs_delete_message -- <queue-url> <receipt-handle>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_sqs::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_sqs::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin sqs_delete_message -- <queue-url> <receipt-handle>");
        std::process::exit(1);
    }
    let queue_url = &args[1];
    let receipt_handle = &args[2];

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    match client.delete_message().queue_url(queue_url).receipt_handle(receipt_handle).send().await {
        Ok(_) => println!("Mensaje eliminado de la cola."),
        Err(error) => {
            eprintln!("Error eliminando el mensaje (el ReceiptHandle pudo haber expirado): {error}");
            return Err(error.into());
        }
    }
    Ok(())
}
