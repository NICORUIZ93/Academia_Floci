// Elimina (confirma el procesamiento de) un mensaje de una cola SQS.
// Uso: node sqs-delete-message.js <queue-url> <receipt-handle>
const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , queueUrl, receiptHandle] = process.argv;

async function main() {
  if (!queueUrl || !receiptHandle) {
    throw new Error('Uso: node sqs-delete-message.js <queue-url> <receipt-handle>');
  }
  await sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle }).promise();
  console.log('Mensaje eliminado de la cola.');
}

main().catch((error) => {
  console.error('Error eliminando el mensaje (el ReceiptHandle pudo haber expirado):', error.message);
  process.exit(1);
});
