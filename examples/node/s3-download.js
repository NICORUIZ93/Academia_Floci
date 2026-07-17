// Descarga un objeto de S3 a un archivo local.
// Uso: node s3-download.js <bucket> <clave> [ruta-destino]
const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  s3ForcePathStyle: true,
});

const [, , bucket, key, destPath] = process.argv;

async function main() {
  if (!bucket || !key) {
    throw new Error('Uso: node s3-download.js <bucket> <clave> [ruta-destino]');
  }
  const output = destPath || key.split('/').pop();

  const result = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  fs.writeFileSync(output, result.Body);
  console.log(`Descargado: s3://${bucket}/${key} -> ${output} (${result.Body.length} bytes)`);
}

main().catch((error) => {
  if (error.code === 'NoSuchKey') {
    console.error(`No existe el objeto "${key}" en el bucket "${bucket}".`);
  } else {
    console.error('Error descargando el archivo:', error.message);
  }
  process.exit(1);
});
