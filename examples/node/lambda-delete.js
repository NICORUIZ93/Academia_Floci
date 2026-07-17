// Elimina una función Lambda.
// Uso: node lambda-delete.js <nombre-funcion>
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const functionName = process.argv[2];

async function main() {
  if (!functionName) {
    throw new Error('Uso: node lambda-delete.js <nombre-funcion>');
  }
  await lambda.deleteFunction({ FunctionName: functionName }).promise();
  console.log('Función eliminada:', functionName);
}

main().catch((error) => {
  if (error.code === 'ResourceNotFoundException') {
    console.error(`No existe la función "${functionName}" (o ya fue eliminada).`);
  } else {
    console.error('Error eliminando la función:', error.message);
  }
  process.exit(1);
});
