// GET /tareas — lista tareas, con filtro opcional por estado vía query string
// (?estado=pendiente). Usa Scan porque la tabla es pequeña; en una tabla grande
// preferirías un GSI sobre "estado" y Query en su lugar (ver Módulo 4).
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_ENDPOINT });
const TABLE_NAME = process.env.TABLE_NAME || 'tareas';

exports.handler = async (event) => {
  const estado = event.queryStringParameters?.estado;

  const params = { TableName: TABLE_NAME };
  if (estado) {
    params.FilterExpression = 'estado = :estado';
    params.ExpressionAttributeValues = { ':estado': estado };
  }

  const result = await dynamodb.scan(params).promise();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tareas: result.Items, total: result.Count }),
  };
};
