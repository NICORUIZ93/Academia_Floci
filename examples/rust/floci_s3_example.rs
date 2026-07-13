// Ejemplo Rust para Floci.
// Requiere crates: aws-config, aws-sdk-s3, aws-credential-types, tokio.
// Objetivo: practicar S3 local con tipos fuertes y manejo explicito de errores.

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_s3::{config::Region, primitives::ByteStream, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_s3::Error> {
    // endpoint_url evita tocar AWS real y dirige el cliente a Floci.
    // force_path_style es importante en localhost porque no hay DNS por bucket.
    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .force_path_style(true)
        .build();
    let client = Client::from_conf(config);

    let result = client
        .put_object()
        .bucket("curso-cloud-local")
        .key("saludos/rust.txt")
        .body(ByteStream::from_static(b"Hola desde Rust y Floci\n"))
        .send()
        .await;

    if let Err(error) = result {
        // Errores frecuentes:
        // NoSuchBucket: crea curso-cloud-local antes de ejecutar.
        // connection refused: levanta Floci con docker compose up -d.
        // credenciales/region: usa test/test y us-east-1.
        eprintln!("Fallo controlado en Floci: {error}");
        return Err(error.into());
    }

    let objects = client
        .list_objects_v2()
        .bucket("curso-cloud-local")
        .send()
        .await?;
    println!("Objetos en Floci: {:?}", objects.contents());
    Ok(())
}
