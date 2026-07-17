// Actualiza el codigo de una funcion Lambda existente y la vuelve a invocar.
// Requiere crates adicionales: zip.
// Uso: cargo run --bin lambda_update -- <nombre-funcion>

use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_lambda::{config::Region, primitives::Blob, Client, Config};
use std::io::Write;

const NUEVO_HANDLER: &str = r#"exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: 'Version actualizada del handler', recibido: event }),
  };
};
"#;

fn build_zip() -> Vec<u8> {
    let mut buffer = std::io::Cursor::new(Vec::new());
    let mut writer = zip::ZipWriter::new(&mut buffer);
    let options = zip::write::FileOptions::<()>::default();
    writer.start_file("index.js", options).unwrap();
    writer.write_all(NUEVO_HANDLER.as_bytes()).unwrap();
    writer.finish().unwrap();
    buffer.into_inner()
}

#[tokio::main]
async fn main() -> Result<(), aws_sdk_lambda::Error> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("Uso: cargo run --bin lambda_update -- <nombre-funcion>");
        std::process::exit(1);
    }
    let function_name = &args[1];
    let zip_bytes = build_zip();

    let config = Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .endpoint_url("http://localhost:4566")
        .region(Region::new("us-east-1"))
        .credentials_provider(Credentials::new("test", "test", None, None, "floci"))
        .build();
    let client = Client::from_conf(config);

    client
        .update_function_code()
        .function_name(function_name)
        .zip_file(Blob::new(zip_bytes))
        .send()
        .await?;
    println!("Codigo actualizado para: {function_name}");

    let invoked = client
        .invoke()
        .function_name(function_name)
        .payload(Blob::new(br#"{"prueba": "post-actualizacion"}"#.to_vec()))
        .send()
        .await?;
    let response = invoked
        .payload()
        .map(|b| String::from_utf8_lossy(b.as_ref()).to_string())
        .unwrap_or_default();
    println!("Respuesta tras actualizar: {response}");
    Ok(())
}
