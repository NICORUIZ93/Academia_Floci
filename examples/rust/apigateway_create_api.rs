// Crea una API REST vacia en API Gateway.
// Requiere crates: aws-config, aws-sdk-apigateway, aws-credential-types, tokio.
// Uso: cargo run --bin apigateway_create_api -- [nombre-api]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_apigateway::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_apigateway::Error> {
    let args: Vec<String> = std::env::args().collect();
    let api_name = args.get(1).cloned().unwrap_or_else(|| "mi-api".to_string());

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let result = client.create_rest_api().name(&api_name).send().await?;
    let api_id = result.id().unwrap_or("?");
    println!("API REST creada: {api_name}");
    println!("API ID: {api_id}");
    println!("Siguiente paso: cargo run --bin apigateway_create_resource -- {api_id}");
    Ok(())
}
