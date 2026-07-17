// DELETE /tareas/{id} — elimina una tarea. Idempotente: borrar algo que ya
// no existe no es un error (mismo comportamiento que DynamoDB DeleteItem).
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_ENDPOINT });
const TABLE_NAME = process.env.TABLE_NAME || 'tareas';

exports.handler = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Falta el id de la tarea en la ruta' }),
    };
  }

  await dynamodb.delete({ TableName: TABLE_NAME, Key: { id } }).promise();

  return { statusCode: 204, body: '' };
};
