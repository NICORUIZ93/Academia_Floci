// Crea una política IAM de solo lectura sobre un bucket S3 específico
// (principio de mínimo privilegio, no AdministratorAccess).
// Uso: node iam-create-policy.js <nombre-politica> <nombre-bucket>
const AWS = require('aws-sdk');

const iam = new AWS.IAM({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , policyName, bucketName] = process.argv;

async function main() {
  if (!policyName || !bucketName) {
    throw new Error('Uso: node iam-create-policy.js <nombre-politica> <nombre-bucket>');
  }

  const document = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject', 's3:ListBucket'],
        Resource: [`arn:aws:s3:::${bucketName}`, `arn:aws:s3:::${bucketName}/*`],
      },
    ],
  };

  const result = await iam.createPolicy({
    PolicyName: policyName,
    PolicyDocument: JSON.stringify(document),
  }).promise();

  console.log('Política creada:', result.Policy.PolicyName);
  console.log('ARN:', result.Policy.Arn);
  console.log('Siguiente paso: node iam-attach-policy.js <usuario>', result.Policy.Arn);
}

main().catch((error) => {
  console.error('Error creando la política:', error.message);
  process.exit(1);
});
