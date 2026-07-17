// Crea una politica IAM de solo lectura sobre un bucket S3 especifico
// (principio de minimo privilegio, no AdministratorAccess).
// Requiere crates adicionales: serde_json.
// Uso: cargo run --bin iam_create_policy -- <nombre-politica> <nombre-bucket>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_iam::{config::Region, Client, Config};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), aws_sdk_iam::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin iam_create_policy -- <nombre-politica> <nombre-bucket>");
        std::process::exit(1);
    }
    let policy_name = &args[1];
    let bucket_name = &args[2];

    let document = json!({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": [
                format!("arn:aws:s3:::{bucket_name}"),
                format!("arn:aws:s3:::{bucket_name}/*"),
            ]
        }]
    });

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    let result = client
        .create_policy()
        .policy_name(policy_name)
        .policy_document(document.to_string())
        .send()
        .await?;
    let policy = result.policy().expect("la API siempre devuelve la politica creada");
    println!("Politica creada: {}", policy.policy_name().unwrap_or("?"));
    println!("ARN: {}", policy.arn().unwrap_or("?"));
    println!(
        "Siguiente paso: cargo run --bin iam_attach_policy -- <usuario> {}",
        policy.arn().unwrap_or("?")
    );
    Ok(())
}
