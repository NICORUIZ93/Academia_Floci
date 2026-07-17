// PUT /tareas/{id} — actualiza el estado y/o descripción de una tarea existente.
// El id llega como parámetro de ruta (event.pathParameters.id), no en el body.
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_ENDPOINT });
const TABLE_NAME = process.env.TABLE_NAME || 'tareas';
const ESTADOS_VALIDOS = ['pendiente', 'en_progreso', 'completada'];

exports.handler = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) {
    return respond(400, { error: 'Falta el id de la tarea en la ruta' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return respond(400, { error: 'El cuerpo de la petición debe ser JSON válido' });
  }

  if (body.estado && !ESTADOS_VALIDOS.includes(body.estado)) {
    return respond(400, { error: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
  }

  const updateParts = [];
  const values = {};
  if (body.estado) {
    updateParts.push('estado = :estado');
    values[':estado'] = body.estado;
  }
  if (body.descripcion !== undefined) {
    updateParts.push('descripcion = :descripcion');
    values[':descripcion'] = body.descripcion;
  }
  if (!updateParts.length) {
    return respond(400, { error: 'No se proporcionó ningún campo para actualizar (estado o descripcion)' });
  }

  try {
    const result = await dynamodb.update({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateParts.join(', ')}`,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'ALL_NEW',
    }).promise();
    return respond(200, result.Attributes);
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return respond(404, { error: `No existe la tarea con id="${id}"` });
    }
    throw error;
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
