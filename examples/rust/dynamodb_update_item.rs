// Actualiza el atributo "estado" de un item existente sin sobrescribir el resto.
// Uso: cargo run --bin dynamodb_update_item -- <tabla> <id> <nuevo-estado>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_dynamodb::{
    config::Region,
    types::{AttributeValue, ReturnValue},
    Client, Config,
};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_dynamodb::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 4 {
        eprintln!("Uso: cargo run --bin dynamodb_update_item -- <tabla> <id> <nuevo-estado>");
        std::process::exit(1);
    }
    let table_name = &args[1];
    let id = &args[2];
    let nuevo_estado = &args[3];

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let result = client
        .update_item()
        .table_name(table_name)
        .key("id", AttributeValue::S(id.clone()))
        .update_expression("SET estado = :nuevoEstado")
        .expression_attribute_values(":nuevoEstado", AttributeValue::S(nuevo_estado.clone()))
        .return_values(ReturnValue::AllNew)
        .send()
        .await?;

    println!("Item actualizado:");
    println!("{:#?}", result.attributes());
    Ok(())
}
