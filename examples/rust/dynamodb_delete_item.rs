// Elimina un item de DynamoDB por su clave primaria.
// Uso: cargo run --bin dynamodb_delete_item -- <tabla> <id>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_dynamodb::{config::Region, types::AttributeValue, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_dynamodb::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin dynamodb_delete_item -- <tabla> <id>");
        std::process::exit(1);
    }
    let table_name = &args[1];
    let id = &args[2];

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    client
        .delete_item()
        .table_name(table_name)
        .key("id", AttributeValue::S(id.clone()))
        .send()
        .await?;

    println!("Item id=\"{id}\" eliminado de {table_name}.");
    Ok(())
}
