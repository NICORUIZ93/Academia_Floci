// Asigna (adjunta) una política IAM a un usuario.
// Uso: node iam-attach-policy.js <nombre-usuario> <arn-politica>
const AWS = require('aws-sdk');

const iam = new AWS.IAM({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
});

const [, , userName, policyArn] = process.argv;

async function main() {
  if (!userName || !policyArn) {
    throw new Error('Uso: node iam-attach-policy.js <nombre-usuario> <arn-politica>');
  }
  await iam.attachUserPolicy({ UserName: userName, PolicyArn: policyArn }).promise();
  console.log(`Política ${policyArn} asignada a ${userName}.`);

  const attached = await iam.listAttachedUserPolicies({ UserName: userName }).promise();
  console.log('Políticas actualmente asignadas:', attached.AttachedPolicies.map((p) => p.PolicyName));
}

main().catch((error) => {
  console.error('Error asignando la política:', error.message);
  process.exit(1);
});
