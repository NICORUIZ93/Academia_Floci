const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({});

// Misma regla de negocio que examples/rutaflow/node/confirm-delivery.ts (recipientPin de
// 6 dígitos) — acá envuelta en el formato de evento SQS que exige AWS::Serverless::Function.
exports.handler = async (event) => {
  for (const record of event.Records) {
    const command = JSON.parse(record.body);
    if (!command.shipmentId || !/^\d{6}$/.test(command.recipientPin)) {
      throw new TypeError('comando de entrega inválido: recipientPin debe tener 6 dígitos');
    }
    await client.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        shipmentId: { S: command.shipmentId },
        sequence: { N: String(Date.now()) },
        tipo: { S: 'entregado' },
        estado: { S: 'entregado' },
      },
    }));
  }
};
