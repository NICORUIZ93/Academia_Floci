// Añade un metodo GET a un recurso, con respuesta mock (sin Lambda todavia).
// Uso: cargo run --bin apigateway_put_method -- <api-id> <resource-id>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_apigateway::{config::Region, types::IntegrationType, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_apigateway::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin apigateway_put_method -- <api-id> <resource-id>");
        std::process::exit(1);
    }
    let api_id = &args[1];
    let resource_id = &args[2];

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    client
        .put_method()
        .rest_api_id(api_id)
        .resource_id(resource_id)
        .http_method("GET")
        .authorization_type("NONE")
        .send()
        .await?;
    println!("Metodo GET creado en el recurso.");

    client
        .put_integration()
        .rest_api_id(api_id)
        .resource_id(resource_id)
        .http_method("GET")
        .r#type(IntegrationType::Mock)
        .request_templates("application/json", r#"{"statusCode": 200}"#)
        .send()
        .await?;
    println!("Integracion MOCK configurada. Para conectar una Lambda real, usa integracion AWS_PROXY.");
    Ok(())
}
