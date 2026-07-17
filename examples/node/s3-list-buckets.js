// Lista todos los buckets S3 existentes en Floci.
// Uso: node s3-list-buckets.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  s3ForcePathStyle: true,
});

async function main() {
  const result = await s3.listBuckets().promise();
  if (!result.Buckets.length) {
    console.log('No hay buckets todavía. Crea uno con s3-create-bucket.js');
    return;
  }
  console.log('Buckets:');
  result.Buckets.forEach((bucket) => {
    console.log(`  - ${bucket.Name} (creado ${bucket.CreationDate.toISOString()})`);
  });
}

main().catch((error) => {
  console.error('Error listando buckets:', error.message);
  process.exit(1);
});
