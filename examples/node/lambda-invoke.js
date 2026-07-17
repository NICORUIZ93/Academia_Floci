// Invoca una función Lambda de forma síncrona y muestra su respuesta.
// Uso: node lambda-invoke.js <nombre-funcion> [json-de-entrada]
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , functionName, payloadJson] = process.argv;

async function main() {
  if (!functionName) {
    throw new Error('Uso: node lambda-invoke.js <nombre-funcion> [json-de-entrada]');
  }
  const payload = payloadJson || JSON.stringify({ origen: 'lambda-invoke.js' });

  const result = await lambda.invoke({
    FunctionName: functionName,
    Payload: payload,
  }).promise();

  console.log('Status code HTTP de la invocación:', result.StatusCode);
  if (result.FunctionError) {
    console.error('La función terminó con error:', result.FunctionError);
  }
  console.log('Respuesta:', result.Payload.toString());
}

main().catch((error) => {
  if (error.code === 'ResourceNotFoundException') {
    console.error(`No existe la función "${functionName}". Créala primero con lambda-create-function.js`);
  } else {
    console.error('Error invocando la función:', error.message);
  }
  process.exit(1);
});
