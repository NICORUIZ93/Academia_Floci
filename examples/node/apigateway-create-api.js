// Crea una API REST vacía en API Gateway.
// Uso: node apigateway-create-api.js [nombre-api]
const AWS = require('aws-sdk');

const apigateway = new AWS.APIGateway({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const apiName = process.argv[2] || 'mi-api';

async function main() {
  const result = await apigateway.createRestApi({ name: apiName }).promise();
  console.log('API REST creada:', apiName);
  console.log('API ID:', result.id);
  console.log('Siguiente paso: node apigateway-create-resource.js', result.id);
}

main().catch((error) => {
  console.error('Error creando la API:', error.message);
  process.exit(1);
});
