## Arquitectura por capas

```
rutas/          → define endpoints HTTP, delega a controladores
controladores/  → traduce request/response, llama a servicios
servicios/      → lógica de negocio, sin saber nada de HTTP
repositorios/   → acceso a datos (Prisma/SQL), sin lógica de negocio
```

Esta separación permite testear la lógica de negocio (servicios) sin levantar un servidor HTTP, y cambiar la base de datos sin tocar las rutas.

```js
// servicios/tareas.js
export async function crearTarea(repo, datos) {
  if (!datos.titulo?.trim()) throw new Error("El título es obligatorio");
  return repo.crear(datos);
}
```

## Uniendo las piezas del track

Este proyecto integra cada módulo anterior: Express + middleware (módulo 4) para la capa HTTP, Prisma + transacciones (módulo 5) para persistencia, JWT (módulo 6) para auth, Supertest + Testcontainers (módulo 7) para tests de integración reales, Pino + correlation ID (módulo 9) para observabilidad, y un Dockerfile multi-stage (módulo 11) para el empaquetado final.

## Qué falta para producción real

Una API "completa" para este curso todavía necesitaría, en un entorno real: monitoreo activo (alertas, no solo logs), un plan de migración de base de datos sin downtime, manejo de secretos fuera del código (Secrets Manager/Vault — justo lo que cubre el track DevOps y el track Cloud), y pruebas de carga para conocer sus límites reales antes de que los usuarios los encuentren por ti.
