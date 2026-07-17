// Recibe (hasta 10) mensajes de una cola SQS sin eliminarlos todavía.
// Uso: node sqs-receive-message.js <queue-url>
const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const queueUrl = process.argv[2];

async function main() {
  if (!queueUrl) {
    throw new Error('Uso: node sqs-receive-message.js <queue-url>');
  }
  const result = await sqs.receiveMessage({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 2,
  }).promise();

  const messages = result.Messages || [];
  if (!messages.length) {
    console.log('No hay mensajes disponibles ahora mismo.');
    return;
  }
  console.log(`${messages.length} mensaje(s) recibido(s):`);
  messages.forEach((msg) => {
    console.log(`  - ${msg.Body} (ReceiptHandle: ${msg.ReceiptHandle.slice(0, 20)}...)`);
  });
  console.log('\nUsa sqs-delete-message.js con el ReceiptHandle completo para confirmarlos.');
}

main().catch((error) => {
  console.error('Error recibiendo mensajes:', error.message);
  process.exit(1);
});
