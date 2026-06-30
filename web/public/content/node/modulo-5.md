## Prisma: schema, migraciones y cliente tipado

```prisma
// schema.prisma
model Tarea {
  id        Int      @id @default(autoincrement())
  titulo    String
  completada Boolean @default(false)
  usuario   Usuario  @relation(fields: [usuarioId], references: [id])
  usuarioId Int
}
```

```bash
npx prisma migrate dev --name agregar_tareas   # genera y aplica la migración SQL
```

```js
const tarea = await prisma.tarea.create({ data: { titulo: "Aprender Prisma", usuarioId: 1 } });
const tareas = await prisma.tarea.findMany({ where: { completada: false }, include: { usuario: true } });
```

## Pool de conexiones

Abrir una conexión nueva a PostgreSQL por cada request es lento y agota los límites del servidor. Un pool mantiene un número fijo de conexiones reutilizables; Prisma y los drivers como `pg` lo gestionan automáticamente.

## Transacciones

```js
await prisma.$transaction(async (tx) => {
  const producto = await tx.producto.findUnique({ where: { id } });
  if (producto.stock < 1) throw new Error("Sin stock");
  await tx.producto.update({ where: { id }, data: { stock: producto.stock - 1 } });
  await tx.pedido.create({ data: { productoId: id } });
});
```

Si cualquier paso falla, **toda** la transacción se revierte — evita estados inconsistentes cuando dos requests compiten por el mismo recurso.
