// Bases de datos — drivers y ORMs (Módulo 5): Prisma, como referencia de ORM
// tipado moderno frente a escribir SQL a mano con un driver nativo.
//
// schema.prisma (referencia, no se ejecuta desde aquí):
//
// model Tarea {
//   id        String   @id @default(uuid())
//   titulo    String
//   completada Boolean @default(false)
//   creada    DateTime @default(now())
// }

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listarPendientes() {
  // Prisma genera tipos TypeScript/autocompletado a partir del schema — el
  // equivalente en JS puro pierde el tipado, pero la API es la misma.
  return prisma.tarea.findMany({
    where: { completada: false },
    orderBy: { creada: 'desc' },
  });
}

async function crearTarea(titulo) {
  return prisma.tarea.create({ data: { titulo } });
}

async function completarTarea(id) {
  // Igual que UpdateItem con ConditionExpression en DynamoDB (ver examples/node/
  // de Cloud): si el id no existe, Prisma lanza una excepción en vez de crear
  // silenciosamente un registro nuevo.
  return prisma.tarea.update({
    where: { id },
    data: { completada: true },
  });
}

async function main() {
  await crearTarea('Probar Prisma');
  console.log(await listarPendientes());
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = { listarPendientes, crearTarea, completarTarea };
