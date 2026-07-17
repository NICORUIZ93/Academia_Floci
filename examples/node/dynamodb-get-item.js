// Obtiene un item de DynamoDB por su clave primaria.
// Uso: node dynamodb-get-item.js <tabla> <id>
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , tableName, id] = process.argv;

async function main() {
  if (!tableName || !id) {
    throw new Error('Uso: node dynamodb-get-item.js <tabla> <id>');
  }
  const result = await dynamodb.getItem({
    TableName: tableName,
    Key: { id: { S: id } },
  }).promise();

  if (!result.Item) {
    console.log(`No existe ningún item con id="${id}" en ${tableName}.`);
    return;
  }
  console.log('Item encontrado:');
  console.log(JSON.stringify(result.Item, null, 2));
}

main().catch((error) => {
  console.error('Error obteniendo el item:', error.message);
  process.exit(1);
});
