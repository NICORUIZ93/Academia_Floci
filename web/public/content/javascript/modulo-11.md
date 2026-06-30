## Tipos básicos e interfaces

```ts
interface Usuario {
  id: number;
  nombre: string;
  rol?: "admin" | "lector"; // opcional, union type
}

type EstadoPedido = "pendiente" | "enviado" | "entregado";

function saludar(usuario: Usuario): string {
  return `Hola, ${usuario.nombre}`;
}
```

## Generics

```ts
function primero<T>(lista: T[]): T | undefined {
  return lista[0];
}

primero<number>([1, 2, 3]); // 1
primero(["a", "b"]);         // "a" — TypeScript infiere T sin que lo escribas
```

## Narrowing

```ts
function formatear(valor: string | number): string {
  if (typeof valor === "number") return valor.toFixed(2); // aquí TS sabe que es number
  return valor.toUpperCase();                               // aquí sabe que es string
}
```

## tsconfig en modo strict

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true
  }
}
```

Con `strict` activado, TypeScript exige tipar explícitamente lo que antes sería `any` implícito, y te obliga a manejar `null`/`undefined` en vez de ignorarlos. Importante: TypeScript solo verifica tipos en tiempo de compilación — los datos que llegan de una API externa en runtime pueden no cumplir el tipo declarado si no los validas (por ejemplo con una librería como `zod`).
