// Invoca una funcion Lambda de forma sincrona y muestra su respuesta.
// Uso: cargo run --bin lambda_invoke -- <nombre-funcion> [json-de-entrada]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_lambda::{config::Region, primitives::Blob, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_lambda::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("Uso: cargo run --bin lambda_invoke -- <nombre-funcion> [json-de-entrada]");
        std::process::exit(1);
    }
    let function_name = &args[1];
    let payload = args.get(2).cloned().unwrap_or_else(|| r#"{"origen": "lambda_invoke.rs"}"#.to_string());

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let result = client
        .invoke()
        .function_name(function_name)
        .payload(Blob::new(payload.into_bytes()))
        .send()
        .await?;

    println!("Status code HTTP de la invocacion: {}", result.status_code());
    if let Some(error) = result.function_error() {
        eprintln!("La funcion termino con error: {error}");
    }
    let response = result
        .payload()
        .map(|b| String::from_utf8_lossy(b.as_ref()).to_string())
        .unwrap_or_default();
    println!("Respuesta: {response}");
    Ok(())
}
