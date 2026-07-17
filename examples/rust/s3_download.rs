// Descarga un objeto de S3 a un archivo local.
// Uso: cargo run --bin s3_download -- <bucket> <clave> [ruta-destino]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_s3::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin s3_download -- <bucket> <clave> [ruta-destino]");
        std::process::exit(1);
    }
    let bucket = &args[1];
    let key = &args[2];
    let dest = args.get(3).cloned().unwrap_or_else(|| key.rsplit('/').next().unwrap().to_string());

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .force_path_style(true)
        .build();
    let client = Client::from_conf(config);

    let result = client.get_object().bucket(bucket).key(key).send().await;
    let output = match result {
        Ok(output) => output,
        Err(error) => {
            eprintln!("Error descargando (¿existe \"{key}\" en \"{bucket}\"?): {error}");
            return Err(error.into());
        }
    };

    let data = output.body.collect().await?.into_bytes();
    std::fs::write(&dest, &data)?;
    println!("Descargado: s3://{bucket}/{key} -> {dest} ({} bytes)", data.len());
    Ok(())
}
