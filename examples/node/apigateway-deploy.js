// Despliega una API REST a un stage, dejándola accesible por HTTP.
// Uso: node apigateway-deploy.js <api-id> [stage]
const AWS = require('aws-sdk');

const apigateway = new AWS.APIGateway({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , apiId, stageArg] = process.argv;
const stage = stageArg || 'dev';

async function main() {
  if (!apiId) {
    throw new Error('Uso: node apigateway-deploy.js <api-id> [stage]');
  }
  // CreateDeployment congela una "foto" de los recursos/métodos actuales de la API y la
  // publica bajo un stage. Sin este paso, los métodos configurados con put-method solo
  // existen en la definición de la API, pero no son alcanzables por HTTP todavía.
  await apigateway.createDeployment({ restApiId: apiId, stageName: stage }).promise();

  const invokeUrl = `http://localhost:4566/restapis/${apiId}/${stage}/_user_request_`;
  console.log(`API desplegada en el stage "${stage}".`);
  console.log('URL de invocación:', invokeUrl);
  console.log(`Prueba con: curl ${invokeUrl}/tareas`);
}

main().catch((error) => {
  console.error('Error desplegando la API:', error.message);
  process.exit(1);
});
