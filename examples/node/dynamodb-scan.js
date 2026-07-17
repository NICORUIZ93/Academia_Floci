// Recorre TODA la tabla, con un filtro opcional. Más costoso que Query: usar con cuidado.
// Uso: node dynamodb-scan.js <tabla> [estado]
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , tableName, estado] = process.argv;

async function main() {
  if (!tableName) {
    throw new Error('Uso: node dynamodb-scan.js <tabla> [estado]');
  }
  const params = { TableName: tableName };
  if (estado) {
    // FilterExpression se aplica DESPUÉS de leer cada item de la tabla completa: no reduce
    // el costo de lectura (RCU), solo lo que se devuelve. Para filtrar de forma eficiente,
    // la clave o un GSI (y Query) siguen siendo preferibles a Scan + filtro.
    params.FilterExpression = 'estado = :estado';
    params.ExpressionAttributeValues = { ':estado': { S: estado } };
  }

  const result = await dynamodb.scan(params).promise();
  console.log(`${result.Count} item(s) (de ${result.ScannedCount} escaneado(s) en total):`);
  console.log(JSON.stringify(result.Items, null, 2));
  if (result.LastEvaluatedKey) {
    console.log('\nHay más resultados: pagina con ExclusiveStartKey usando LastEvaluatedKey.');
  }
}

main().catch((error) => {
  console.error('Error escaneando la tabla:', error.message);
  process.exit(1);
});
