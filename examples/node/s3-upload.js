// Sube un archivo local a un bucket S3 en Floci.
// Uso: node s3-upload.js <bucket> <ruta-local> [clave-destino]
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  s3ForcePathStyle: true,
});

const [, , bucket, filePath, destKey] = process.argv;

async function main() {
  if (!bucket || !filePath) {
    throw new Error('Uso: node s3-upload.js <bucket> <ruta-local> [clave-destino]');
  }
  const key = destKey || path.basename(filePath);
  const body = fs.readFileSync(filePath);

  await s3.putObject({ Bucket: bucket, Key: key, Body: body }).promise();
  console.log(`Subido: ${filePath} -> s3://${bucket}/${key} (${body.length} bytes)`);
}

main().catch((error) => {
  console.error('Error subiendo el archivo:', error.message);
  process.exit(1);
});
