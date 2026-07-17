// Lista todos los buckets S3 existentes en Floci.
// Requiere crates: aws-config, aws-sdk-s3, aws-credential-types, tokio.
// Uso: cargo run --bin s3_list_buckets

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_s3::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_s3::Error> {
    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .force_path_style(true)
        .build();
    let client = Client::from_conf(config);

    let result = client.list_buckets().send().await?;
    let buckets = result.buckets();

    if buckets.is_empty() {
        println!("No hay buckets todavia. Crea uno con s3_create_bucket.rs");
        return Ok(());
    }
    println!("Buckets:");
    for bucket in buckets {
        println!(
            "  - {} (creado {:?})",
            bucket.name().unwrap_or("?"),
            bucket.creation_date()
        );
    }
    Ok(())
}
