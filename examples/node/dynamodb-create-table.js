// Crea una tabla DynamoDB con clave primaria simple "id".
// Uso: node dynamodb-create-table.js [nombre-tabla]
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const tableName = process.argv[2] || `MiTabla${Date.now()}`;

async function waitForActive() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const result = await dynamodb.describeTable({ TableName: tableName }).promise().catch(() => null);
    if (result?.Table?.TableStatus === 'ACTIVE') return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`La tabla ${tableName} no llegó a estado ACTIVE a tiempo`);
}

async function main() {
  await dynamodb.createTable({
    TableName: tableName,
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST',
  }).promise();
  await waitForActive();
  console.log('Tabla creada y activa:', tableName);
}

main().catch((error) => {
  console.error('Error creando la tabla:', error.message);
  process.exit(1);
});
