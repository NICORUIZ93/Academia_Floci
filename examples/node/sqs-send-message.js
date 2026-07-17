// Envía un mensaje a una cola SQS.
// Uso: node sqs-send-message.js <queue-url> <texto-del-mensaje>
const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , queueUrl, ...messageParts] = process.argv;
const messageBody = messageParts.join(' ');

async function main() {
  if (!queueUrl || !messageBody) {
    throw new Error('Uso: node sqs-send-message.js <queue-url> <texto-del-mensaje>');
  }
  const result = await sqs.sendMessage({ QueueUrl: queueUrl, MessageBody: messageBody }).promise();
  console.log('Mensaje enviado. MessageId:', result.MessageId);
}

main().catch((error) => {
  console.error('Error enviando el mensaje:', error.message);
  process.exit(1);
});
