// Crea un bucket S3 nuevo en Floci.
// Uso: cargo run --bin s3_create_bucket -- [nombre-del-bucket]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_s3::{config::Region, Client, Config};
use std::time::{SystemTime, UNIX_EPOCH};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_s3::Error> {
    let args: Vec<String> = std::env::args().collect();
    let bucket_name = args.get(1).cloned().unwrap_or_else(|| {
        let millis = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
        format!("mi-bucket-{millis}")
    });

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .force_path_style(true)
        .build();
    let client = Client::from_conf(config);

    match client.create_bucket().bucket(&bucket_name).send().await {
        Ok(_) => println!("Bucket creado: {bucket_name}"),
        Err(error) => {
            eprintln!("Error creando el bucket (¿ya existe \"{bucket_name}\"?): {error}");
            return Err(error.into());
        }
    }
    Ok(())
}
