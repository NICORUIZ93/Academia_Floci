// Crea un bucket S3 nuevo en Floci.
// Uso: node s3-create-bucket.js [nombre-del-bucket]
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  s3ForcePathStyle: true,
});

const bucketName = process.argv[2] || `mi-bucket-${Date.now()}`;

async function main() {
  await s3.createBucket({ Bucket: bucketName }).promise();
  console.log('Bucket creado:', bucketName);
}

main().catch((error) => {
  if (error.code === 'BucketAlreadyOwnedByYou') {
    console.error(`El bucket "${bucketName}" ya existe. Elige otro nombre o elimínalo primero.`);
  } else {
    console.error('Error creando el bucket:', error.message);
  }
  process.exit(1);
});
