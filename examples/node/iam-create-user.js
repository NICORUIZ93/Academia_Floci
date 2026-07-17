// Crea un usuario IAM.
// Uso: node iam-create-user.js [nombre-usuario]
const AWS = require('aws-sdk');

const iam = new AWS.IAM({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const userName = process.argv[2] || 'mi-usuario';

async function main() {
  const result = await iam.createUser({ UserName: userName }).promise();
  console.log('Usuario IAM creado:', result.User.UserName);
  console.log('ARN:', result.User.Arn);
  console.log('Siguiente paso: node iam-create-policy.js');
}

main().catch((error) => {
  if (error.code === 'EntityAlreadyExists') {
    console.error(`El usuario "${userName}" ya existe.`);
  } else {
    console.error('Error creando el usuario:', error.message);
  }
  process.exit(1);
});
