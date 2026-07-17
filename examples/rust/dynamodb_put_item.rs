// Inserta (o sobrescribe) un item en una tabla DynamoDB.
// Uso: cargo run --bin dynamodb_put_item -- <tabla> <id> <titulo>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_dynamodb::{config::Region, types::AttributeValue, Client, Config};
use std::time::{SystemTime, UNIX_EPOCH};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_dynamodb::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin dynamodb_put_item -- <tabla> <id> <titulo>");
        std::process::exit(1);
    }
    let table_name = &args[1];
    let id = &args[2];
    let titulo = if args.len() > 3 { args[3..].join(" ") } else { "Sin titulo".to_string() };
    let creado = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis().to_string();

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    client
        .put_item()
        .table_name(table_name)
        .item("id", AttributeValue::S(id.clone()))
        .item("titulo", AttributeValue::S(titulo.clone()))
        .item("estado", AttributeValue::S("pendiente".to_string()))
        .item("creado", AttributeValue::N(creado))
        .send()
        .await?;

    println!("Item insertado en {table_name}: id={id}, titulo=\"{titulo}\"");
    Ok(())
}
