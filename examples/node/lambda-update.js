// Actualiza el código de una función Lambda existente y la vuelve a invocar.
// Uso: node lambda-update.js <nombre-funcion>
const AWS = require('aws-sdk');
const JSZip = require('jszip');

const lambda = new AWS.Lambda({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const functionName = process.argv[2];

const NUEVO_HANDLER = `
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: 'Versión actualizada del handler', recibido: event }),
  };
};
`;

async function main() {
  if (!functionName) {
    throw new Error('Uso: node lambda-update.js <nombre-funcion>');
  }
  const zip = new JSZip();
  zip.file('index.js', NUEVO_HANDLER);
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  await lambda.updateFunctionCode({
    FunctionName: functionName,
    ZipFile: zipBuffer,
  }).promise();
  console.log('Código actualizado para:', functionName);

  const invoked = await lambda.invoke({
    FunctionName: functionName,
    Payload: JSON.stringify({ prueba: 'post-actualización' }),
  }).promise();
  console.log('Respuesta tras actualizar:', invoked.Payload.toString());
}

main().catch((error) => {
  console.error('Error actualizando la función:', error.message);
  process.exit(1);
});
