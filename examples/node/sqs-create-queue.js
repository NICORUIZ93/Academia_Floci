// Crea una cola SQS en Floci.
// Uso: node sqs-create-queue.js [nombre-de-cola]
const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const queueName = process.argv[2] || `mi-cola-${Date.now()}`;

async function main() {
  const result = await sqs.createQueue({ QueueName: queueName }).promise();
  console.log('Cola creada:', queueName);
  console.log('URL:', result.QueueUrl);
}

main().catch((error) => {
  console.error('Error creando la cola:', error.message);
  process.exit(1);
});
