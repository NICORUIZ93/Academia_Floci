// Elimina un objeto de S3 (y opcionalmente el bucket si queda vacío).
// Uso: node s3-delete.js <bucket> <clave> [--bucket-tambien]
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  s3ForcePathStyle: true,
});

const [, , bucket, key, flag] = process.argv;

async function main() {
  if (!bucket || !key) {
    throw new Error('Uso: node s3-delete.js <bucket> <clave> [--bucket-tambien]');
  }
  await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
  console.log(`Objeto eliminado: s3://${bucket}/${key}`);

  if (flag === '--bucket-tambien') {
    await s3.deleteBucket({ Bucket: bucket }).promise();
    console.log(`Bucket eliminado: ${bucket}`);
  }
}

main().catch((error) => {
  if (error.code === 'BucketNotEmpty') {
    console.error('El bucket todavía tiene objetos. Elimínalos antes de borrar el bucket.');
  } else {
    console.error('Error eliminando:', error.message);
  }
  process.exit(1);
});
