// Actualiza el atributo "estado" de un item existente sin sobrescribir el resto.
// Uso: node dynamodb-update-item.js <tabla> <id> <nuevo-estado>
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , tableName, id, nuevoEstado] = process.argv;

async function main() {
  if (!tableName || !id || !nuevoEstado) {
    throw new Error('Uso: node dynamodb-update-item.js <tabla> <id> <nuevo-estado>');
  }
  const result = await dynamodb.updateItem({
    TableName: tableName,
    Key: { id: { S: id } },
    UpdateExpression: 'SET estado = :nuevoEstado',
    ExpressionAttributeValues: { ':nuevoEstado': { S: nuevoEstado } },
    ReturnValues: 'ALL_NEW',
  }).promise();
  console.log('Item actualizado:');
  console.log(JSON.stringify(result.Attributes, null, 2));
}

main().catch((error) => {
  console.error('Error actualizando el item:', error.message);
  process.exit(1);
});
