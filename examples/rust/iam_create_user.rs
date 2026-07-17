// Crea un usuario IAM.
// Requiere crates: aws-config, aws-sdk-iam, aws-credential-types, tokio.
// Uso: cargo run --bin iam_create_user -- [nombre-usuario]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_iam::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_iam::Error> {
    let args: Vec<String> = std::env::args().collect();
    let user_name = args.get(1).cloned().unwrap_or_else(|| "mi-usuario".to_string());

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let result = client.create_user().user_name(&user_name).send().await?;
    let user = result.user().expect("la API siempre devuelve el usuario creado");
    println!("Usuario IAM creado: {}", user.user_name());
    println!("ARN: {}", user.arn());
    println!("Siguiente paso: cargo run --bin iam_create_policy");
    Ok(())
}
