// Consulta items de DynamoDB por clave de partición con Query (más eficiente que Scan).
// Uso: node dynamodb-query.js <tabla> <id>
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , tableName, id] = process.argv;

async function main() {
  if (!tableName || !id) {
    throw new Error('Uso: node dynamodb-query.js <tabla> <id>');
  }
  // Query exige una condición de igualdad sobre la clave de partición (KeyConditionExpression).
  // Con una tabla de clave simple como esta, Query devuelve como máximo un item: su verdadera
  // ventaja aparece con una clave de ordenación o un índice secundario (GSI, ver Módulo 4),
  // donde puedes acotar un rango de items relacionados sin recorrer la tabla entera.
  const result = await dynamodb.query({
    TableName: tableName,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: { ':id': { S: id } },
  }).promise();

  if (!result.Items.length) {
    console.log(`No existe ningún item con id="${id}" en ${tableName}.`);
    return;
  }
  console.log(`${result.Count} item(s) encontrado(s) (escaneados: ${result.ScannedCount}):`);
  console.log(JSON.stringify(result.Items, null, 2));
}

main().catch((error) => {
  console.error('Error consultando la tabla:', error.message);
  process.exit(1);
});
