// Sube un archivo local a un bucket S3 en Floci.
// Uso: cargo run --bin s3_upload -- <bucket> <ruta-local> [clave-destino]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_s3::{config::Region, primitives::ByteStream, Client, Config};
use std::path::Path;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin s3_upload -- <bucket> <ruta-local> [clave-destino]");
        std::process::exit(1);
    }
    let bucket = &args[1];
    let file_path = &args[2];
    let key = args
        .get(3)
        .cloned()
        .unwrap_or_else(|| Path::new(file_path).file_name().unwrap().to_string_lossy().to_string());

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .force_path_style(true)
        .build();
    let client = Client::from_conf(config);

    let body = ByteStream::from_path(file_path).await?;
    let metadata = std::fs::metadata(file_path)?;

    client.put_object().bucket(bucket).key(&key).body(body).send().await?;
    println!("Subido: {file_path} -> s3://{bucket}/{key} ({} bytes)", metadata.len());
    Ok(())
}
