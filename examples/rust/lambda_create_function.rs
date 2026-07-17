// Empaqueta un handler minimo y despliega una funcion Lambda en Floci.
// Requiere crates adicionales: zip, tokio (features = ["full"]).
// Uso: cargo run --bin lambda_create_function -- [nombre-funcion]

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_lambda::{
    config::Region,
    primitives::Blob,
    types::{FunctionCode, Runtime},
    Client, Config,
};
use std::io::Write;

const HANDLER_CODE: &str = r#"exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: 'Hola desde Lambda en Floci', recibido: event }),
  };
};
"#;

fn build_zip() -> Vec<u8> {
    let mut buffer = std::io::Cursor::new(Vec::new());
    let mut writer = zip::ZipWriter::new(&mut buffer);
    let options = zip::write::FileOptions::<()>::default();
    writer.start_file("index.js", options).unwrap();
    writer.write_all(HANDLER_CODE.as_bytes()).unwrap();
    writer.finish().unwrap();
    buffer.into_inner()
}

#[tokio::main]
async fn main() -> Result<(), aws_sdk_lambda::Error> {
    let args: Vec<String> = std::env::args().collect();
    let function_name = args.get(1).cloned().unwrap_or_else(|| "mi-funcion".to_string());

    let zip_bytes = build_zip();

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    client
        .create_function()
        .function_name(&function_name)
        .runtime(Runtime::Nodejs20x)
        .role("arn:aws:iam::000000000000:role/lambda-role")
        .handler("index.handler")
        .code(FunctionCode::builder().zip_file(Blob::new(zip_bytes)).build())
        .send()
        .await?;

    println!("Funcion Lambda creada: {function_name}");
    println!("Invocala con: cargo run --bin lambda_invoke -- {function_name}");
    Ok(())
}
