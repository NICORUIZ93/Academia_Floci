import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

const config = {
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
};

const s3 = new S3Client({ ...config, forcePathStyle: true });
const sqs = new SQSClient(config);

await s3.send(
  new PutObjectCommand({
    Bucket: "curso-floci",
    Key: "saludos/node.txt",
    Body: "Hola desde Node.js y Floci\n",
  }),
);

const { QueueUrl } = await sqs.send(
  new GetQueueUrlCommand({ QueueName: "pedidos" }),
);
await sqs.send(
  new SendMessageCommand({
    QueueUrl,
    MessageBody: JSON.stringify({ pedidoId: "P-200", estado: "creado" }),
  }),
);

console.log(await s3.send(new ListObjectsV2Command({ Bucket: "curso-floci" })));
console.log(await sqs.send(new ReceiveMessageCommand({ QueueUrl })));

