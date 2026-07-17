// Crea un recurso (ruta) /tareas bajo el recurso raíz de una API REST.
// Uso: node apigateway-create-resource.js <api-id> [ruta]
const AWS = require('aws-sdk');

const apigateway = new AWS.APIGateway({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , apiId, pathPart] = process.argv;
const nuevaRuta = pathPart || 'tareas';

async function main() {
  if (!apiId) {
    throw new Error('Uso: node apigateway-create-resource.js <api-id> [ruta]');
  }
  const resources = await apigateway.getResources({ restApiId: apiId }).promise();
  const root = resources.items.find((r) => r.path === '/');
  if (!root) throw new Error('No se encontró el recurso raíz "/" de la API');

  const created = await apigateway.createResource({
    restApiId: apiId,
    parentId: root.id,
    pathPart: nuevaRuta,
  }).promise();

  console.log(`Recurso creado: /${nuevaRuta}`);
  console.log('Resource ID:', created.id);
  console.log('Siguiente paso: node apigateway-put-method.js', apiId, created.id);
}

main().catch((error) => {
  console.error('Error creando el recurso:', error.message);
  process.exit(1);
});
