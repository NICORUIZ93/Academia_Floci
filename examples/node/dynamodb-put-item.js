// Inserta (o sobrescribe) un item en una tabla DynamoDB.
// Uso: node dynamodb-put-item.js <tabla> <id> <titulo>
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , tableName, id, ...tituloParts] = process.argv;
const titulo = tituloParts.join(' ') || 'Sin título';

async function main() {
  if (!tableName || !id) {
    throw new Error('Uso: node dynamodb-put-item.js <tabla> <id> <titulo>');
  }
  await dynamodb.putItem({
    TableName: tableName,
    Item: {
      id: { S: id },
      titulo: { S: titulo },
      estado: { S: 'pendiente' },
      creado: { N: String(Date.now()) },
    },
  }).promise();
  console.log(`Item insertado en ${tableName}: id=${id}, titulo="${titulo}"`);
}

main().catch((error) => {
  console.error('Error insertando el item:', error.message);
  process.exit(1);
});
