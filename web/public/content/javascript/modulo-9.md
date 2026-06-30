## Tu primer test con Vitest

```js
// suma.js
export function sumar(a, b) { return a + b; }

// suma.test.js
import { describe, it, expect } from "vitest";
import { sumar } from "./suma.js";

describe("sumar", () => {
  it("suma dos números positivos", () => {
    expect(sumar(2, 3)).toBe(5);
  });
});
```

## Mocks, spies y fake timers

```js
import { vi } from "vitest";

// spy: observa llamadas a una función real
const spy = vi.fn();
spy("hola");
expect(spy).toHaveBeenCalledWith("hola");

// fake timers: para probar debounce/throttle sin esperar de verdad
vi.useFakeTimers();
debounceFn();
vi.advanceTimersByTime(300);
expect(callback).toHaveBeenCalled();
```

## Mockear fetch

```js
vi.spyOn(global, "fetch").mockResolvedValue({
  ok: true,
  json: async () => ([{ id: 1, nombre: "Ana" }]),
});
```

## ESLint + Prettier

ESLint detecta errores y malas prácticas (variables no usadas, comparaciones con `==`); Prettier formatea el código de forma consistente. Se complementan: ESLint para reglas de calidad, Prettier para estilo visual.

```bash
npm init @eslint/config@latest
npx prettier --write .
```

La cobertura de código (`vitest --coverage`) mide qué líneas/ramas se ejecutaron durante los tests — útil para encontrar código sin probar, pero 100% de cobertura no significa "sin bugs": solo significa que el código se ejecutó, no que se verificó correctamente.
