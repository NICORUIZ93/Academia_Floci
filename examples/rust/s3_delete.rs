// Elimina un objeto de S3 (y opcionalmente el bucket si queda vacio).
// Uso: cargo run --bin s3_delete -- <bucket> <clave> [--bucket-tambien]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_s3::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_s3::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin s3_delete -- <bucket> <clave> [--bucket-tambien]");
        std::process::exit(1);
    }
    let bucket = &args[1];
    let key = &args[2];
    let borrar_bucket = args.get(3).map(|s| s.as_str()) == Some("--bucket-tambien");

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .force_path_style(true)
        .build();
    let client = Client::from_conf(config);

    client.delete_object().bucket(bucket).key(key).send().await?;
    println!("Objeto eliminado: s3://{bucket}/{key}");

    if borrar_bucket {
        client.delete_bucket().bucket(bucket).send().await?;
        println!("Bucket eliminado: {bucket}");
    }
    Ok(())
}
