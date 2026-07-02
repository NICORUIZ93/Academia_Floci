const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  s3ForcePathStyle: true,
});

async function listBuckets() {
  const data = await s3.listBuckets().promise();
  console.log('Buckets en Floci:', data.Buckets);
}

listBuckets().catch((error) => {
  console.error('No se pudo conectar a Floci:', error.message);
  process.exit(1);
});
