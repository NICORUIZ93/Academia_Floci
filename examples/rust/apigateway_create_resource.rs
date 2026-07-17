// Crea un recurso (ruta) /tareas bajo el recurso raiz de una API REST.
// Uso: cargo run --bin apigateway_create_resource -- <api-id> [ruta]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_apigateway::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("Uso: cargo run --bin apigateway_create_resource -- <api-id> [ruta]");
        std::process::exit(1);
    }
    let api_id = &args[1];
    let path_part = args.get(2).cloned().unwrap_or_else(|| "tareas".to_string());

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let resources = client.get_resources().rest_api_id(api_id).send().await?;
    let root_id = resources
        .items()
        .iter()
        .find(|r| r.path() == Some("/"))
        .and_then(|r| r.id())
        .ok_or("No se encontro el recurso raiz \"/\" de la API")?
        .to_string();

    let created = client
        .create_resource()
        .rest_api_id(api_id)
        .parent_id(&root_id)
        .path_part(&path_part)
        .send()
        .await?;
    let resource_id = created.id().unwrap_or("?");

    println!("Recurso creado: /{path_part}");
    println!("Resource ID: {resource_id}");
    println!("Siguiente paso: cargo run --bin apigateway_put_method -- {api_id} {resource_id}");
    Ok(())
}
