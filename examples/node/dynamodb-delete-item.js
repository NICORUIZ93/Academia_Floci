// Elimina un item de DynamoDB por su clave primaria.
// Uso: node dynamodb-delete-item.js <tabla> <id>
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , tableName, id] = process.argv;

async function main() {
  if (!tableName || !id) {
    throw new Error('Uso: node dynamodb-delete-item.js <tabla> <id>');
  }
  await dynamodb.deleteItem({
    TableName: tableName,
    Key: { id: { S: id } },
  }).promise();
  console.log(`Item id="${id}" eliminado de ${tableName}.`);
}

main().catch((error) => {
  console.error('Error eliminando el item:', error.message);
  process.exit(1);
});
