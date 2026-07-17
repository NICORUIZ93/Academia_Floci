// Añade un método GET a un recurso, con respuesta mock (sin Lambda todavía).
// Uso: node apigateway-put-method.js <api-id> <resource-id>
const AWS = require('aws-sdk');

const apigateway = new AWS.APIGateway({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , apiId, resourceId] = process.argv;

async function main() {
  if (!apiId || !resourceId) {
    throw new Error('Uso: node apigateway-put-method.js <api-id> <resource-id>');
  }

  await apigateway.putMethod({
    restApiId: apiId,
    resourceId,
    httpMethod: 'GET',
    authorizationType: 'NONE',
  }).promise();
  console.log('Método GET creado en el recurso.');

  // Integración MOCK: responde sin invocar ningún backend real todavía.
  await apigateway.putIntegration({
    restApiId: apiId,
    resourceId,
    httpMethod: 'GET',
    type: 'MOCK',
    requestTemplates: { 'application/json': '{"statusCode": 200}' },
  }).promise();
  console.log('Integración MOCK configurada. Para conectar una Lambda real, usa integración AWS_PROXY.');
}

main().catch((error) => {
  console.error('Error configurando el método:', error.message);
  process.exit(1);
});
