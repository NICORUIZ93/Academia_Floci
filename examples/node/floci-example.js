// Cambio P1: ejemplo completo de Floci en Node.js.
// Cubre S3, SQS y DynamoDB con creacion, uso y limpieza.
const AWS = require('aws-sdk');

const endpoint = 'http://localhost:4566';
const region = 'us-east-1';
const credentials = { accessKeyId: 'test', secretAccessKey: 'test' };

const s3 = new AWS.S3({
  endpoint,
  region,
  credentials,
  s3ForcePathStyle: true,
});

const sqs = new AWS.SQS({ endpoint, region, credentials });
const dynamodb = new AWS.DynamoDB({ endpoint, region, credentials });

const bucketName = `academia-floci-node-${Date.now()}`;
const objectKey = 'hola-floci.txt';
const queueName = `academia-floci-node-${Date.now()}`;
const tableName = `AcademiaFlociNode${Date.now()}`;

async function runS3Example() {
  console.log('\nS3');
  await s3.createBucket({ Bucket: bucketName }).promise();
  console.log('Bucket creado:', bucketName);

  await s3.putObject({
    Bucket: bucketName,
    Key: objectKey,
    Body: 'Hola desde Node.js y Floci',
  }).promise();
  console.log('Objeto subido:', objectKey);

  const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
  console.log('Objetos:', objects.Contents.map((item) => item.Key));

  const downloaded = await s3.getObject({ Bucket: bucketName, Key: objectKey }).promise();
  console.log('Descargado:', downloaded.Body.toString('utf8'));

  await s3.deleteObject({ Bucket: bucketName, Key: objectKey }).promise();
  await s3.deleteBucket({ Bucket: bucketName }).promise();
  console.log('Bucket limpiado');
}

async function runSqsExample() {
  console.log('\nSQS');
  const created = await sqs.createQueue({ QueueName: queueName }).promise();
  const QueueUrl = created.QueueUrl;
  console.log('Cola creada:', QueueUrl);

  await sqs.sendMessage({ QueueUrl, MessageBody: 'Hola desde SQS en Floci' }).promise();
  console.log('Mensaje enviado');

  const received = await sqs.receiveMessage({
    QueueUrl,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 1,
  }).promise();
  const message = received.Messages?.[0];
  console.log('Mensaje recibido:', message?.Body || 'sin mensajes');

  if (message?.ReceiptHandle) {
    await sqs.deleteMessage({ QueueUrl, ReceiptHandle: message.ReceiptHandle }).promise();
    console.log('Mensaje eliminado');
  }

  await sqs.deleteQueue({ QueueUrl }).promise();
  console.log('Cola eliminada');
}

async function waitForTable(status) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const result = await dynamodb.describeTable({ TableName: tableName }).promise().catch(() => null);
    if (result?.Table?.TableStatus === status) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`La tabla ${tableName} no llego a estado ${status}`);
}

async function runDynamoDbExample() {
  console.log('\nDynamoDB');
  await dynamodb.createTable({
    TableName: tableName,
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST',
  }).promise();
  await waitForTable('ACTIVE');
  console.log('Tabla creada:', tableName);

  await dynamodb.putItem({
    TableName: tableName,
    Item: {
      id: { S: '1' },
      titulo: { S: 'Aprender Floci con Node.js' },
      estado: { S: 'pendiente' },
    },
  }).promise();
  console.log('Item insertado');

  const item = await dynamodb.getItem({
    TableName: tableName,
    Key: { id: { S: '1' } },
  }).promise();
  console.log('Item obtenido:', item.Item);

  const scan = await dynamodb.scan({ TableName: tableName }).promise();
  console.log('Items en tabla:', scan.Count);

  await dynamodb.deleteItem({
    TableName: tableName,
    Key: { id: { S: '1' } },
  }).promise();
  console.log('Item eliminado');

  await dynamodb.deleteTable({ TableName: tableName }).promise();
  console.log('Tabla eliminada');
}

async function main() {
  await runS3Example();
  await runSqsExample();
  await runDynamoDbExample();
  console.log('\nEjemplo Node.js completado correctamente');
}

main().catch((error) => {
  console.error('No se pudo ejecutar el ejemplo contra Floci:', error.message);
  console.error('Verifica que Floci este activo con: ./scripts/validate-floci.sh');
  process.exit(1);
});
