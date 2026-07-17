// Crea una tabla DynamoDB con clave primaria simple "id".
// Requiere crates: aws-config, aws-sdk-dynamodb, aws-credential-types, tokio.
// Uso: cargo run --bin dynamodb_create_table -- [nombre-tabla]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_dynamodb::{
    config::Region,
    types::{AttributeDefinition, BillingMode, KeySchemaElement, KeyType, ScalarAttributeType, TableStatus},
    Client, Config,
};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    let table_name = args.get(1).cloned().unwrap_or_else(|| {
        let millis = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
        format!("MiTabla{millis}")
    });

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    client
        .create_table()
        .table_name(&table_name)
        .attribute_definitions(
            AttributeDefinition::builder()
                .attribute_name("id")
                .attribute_type(ScalarAttributeType::S)
                .build()?,
        )
        .key_schema(KeySchemaElement::builder().attribute_name("id").key_type(KeyType::Hash).build()?)
        .billing_mode(BillingMode::PayPerRequest)
        .send()
        .await?;

    for _ in 0..20 {
        let describe = client.describe_table().table_name(&table_name).send().await;
        if let Ok(output) = describe {
            if output.table().and_then(|t| t.table_status()) == Some(&TableStatus::Active) {
                println!("Tabla creada y activa: {table_name}");
                return Ok(());
            }
        }
        tokio::time::sleep(Duration::from_millis(500)).await;
    }
    Err(format!("La tabla {table_name} no llego a estado ACTIVE a tiempo").into())
}
