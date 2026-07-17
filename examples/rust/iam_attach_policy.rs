// Asigna (adjunta) una politica IAM a un usuario.
// Uso: cargo run --bin iam_attach_policy -- <nombre-usuario> <arn-politica>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_iam::{config::Region, Client, Config};

#[tokio::main]
async fn main() -> Result<(), aws_sdk_iam::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Uso: cargo run --bin iam_attach_policy -- <nombre-usuario> <arn-politica>");
        std::process::exit(1);
    }
    let user_name = &args[1];
    let policy_arn = &args[2];

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    client
        .attach_user_policy()
        .user_name(user_name)
        .policy_arn(policy_arn)
        .send()
        .await?;
    println!("Politica {policy_arn} asignada a {user_name}.");

    let attached = client.list_attached_user_policies().user_name(user_name).send().await?;
    let names: Vec<&str> = attached
        .attached_policies()
        .iter()
        .filter_map(|p| p.policy_name())
        .collect();
    println!("Politicas actualmente asignadas: {names:?}");
    Ok(())
}
