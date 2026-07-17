// Empaqueta un handler mínimo y despliega una función Lambda en Floci.
// Uso: node lambda-create-function.js [nombre-funcion]
const fs = require('fs');
const os = require('os');
const path = require('path');
const AWS = require('aws-sdk');
const JSZip = require('jszip');

const lambda = new AWS.Lambda({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const functionName = process.argv[2] || 'mi-funcion';

const HANDLER_CODE = `
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: 'Hola desde Lambda en Floci', recibido: event }),
  };
};
`;

async function buildZip() {
  const zip = new JSZip();
  zip.file('index.js', HANDLER_CODE);
  return zip.generateAsync({ type: 'nodebuffer' });
}

async function main() {
  const zipBuffer = await buildZip();
  const tmpZip = path.join(os.tmpdir(), 'lambda-package.zip');
  fs.writeFileSync(tmpZip, zipBuffer);

  await lambda.createFunction({
    FunctionName: functionName,
    Runtime: 'nodejs20.x',
    Role: 'arn:aws:iam::000000000000:role/lambda-role',
    Handler: 'index.handler',
    Code: { ZipFile: zipBuffer },
  }).promise();

  console.log('Función Lambda creada:', functionName);
  console.log('Invócala con: node lambda-invoke.js', functionName);
}

main().catch((error) => {
  console.error('Error creando la función:', error.message);
  console.error('Requiere la dependencia "jszip" (npm install jszip) para empaquetar el código.');
  process.exit(1);
});
