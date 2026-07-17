// POST /tareas — crea una tarea nueva en DynamoDB y encola un mensaje SQS
// para procesamiento en segundo plano (ej. notificaciones).
// Integración: API Gateway proxy (AWS_PROXY), event = petición HTTP completa.
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({ endpoint: process.env.DYNAMODB_ENDPOINT });
const sqs = new AWS.SQS({ endpoint: process.env.SQS_ENDPOINT });

const TABLE_NAME = process.env.TABLE_NAME || 'tareas';
const QUEUE_URL = process.env.QUEUE_URL;

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return respond(400, { error: 'El cuerpo de la petición debe ser JSON válido' });
  }

  if (!body.titulo || typeof body.titulo !== 'string') {
    return respond(400, { error: 'El campo "titulo" es obligatorio y debe ser texto' });
  }

  const tarea = {
    id: `tarea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    titulo: body.titulo,
    descripcion: body.descripcion || '',
    estado: 'pendiente',
    creado: new Date().toISOString(),
  };

  await dynamodb.put({ TableName: TABLE_NAME, Item: tarea }).promise();

  if (QUEUE_URL) {
    await sqs.sendMessage({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({ tipo: 'tarea_creada', tareaId: tarea.id }),
    }).promise();
  }

  return respond(201, tarea);
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
