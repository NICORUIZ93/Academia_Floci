// Lista todos los buckets S3 existentes en Floci con AWS SDK v3.
// Uso (desde examples/node): npm install && node s3-list-buckets.js
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  // Floci local resuelve mejor las URLs como /bucket/objeto que como subdominios.
  forcePathStyle: true,
});

async function main() {
  const result = await s3.send(new ListBucketsCommand({}));
  const buckets = result.Buckets ?? [];
  if (!buckets.length) {
    console.log('No hay buckets todavía. Crea uno con s3-create-bucket.js');
    return;
  }
  console.log('Buckets:');
  buckets.forEach((bucket) => {
    const creationDate = bucket.CreationDate?.toISOString() ?? 'fecha no disponible';
    console.log(`  - ${bucket.Name} (creado ${creationDate})`);
  });
}

main().catch((error) => {
  console.error('Error listando buckets:', error.message);
  process.exit(1);
});
