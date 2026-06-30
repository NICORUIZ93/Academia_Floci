## ESM vs CommonJS

ESM (`import`/`export`) es el estándar del lenguaje, estático y analizable en tiempo de build — eso es lo que permite el tree-shaking. CommonJS (`require`/`module.exports`) es dinámico y resuelve en tiempo de ejecución.

```js
// ESM (math.mjs)
export function sumar(a, b) { return a + b; }
export default function restar(a, b) { return a - b; }

// CommonJS (math.cjs)
function sumar(a, b) { return a + b; }
module.exports = { sumar };
```

`package.json` con `"type": "module"` hace que `.js` se interprete como ESM por defecto.

## Qué hace un bundler

Vite (en desarrollo) sirve módulos ESM nativos sin empaquetar, usando esbuild para transformar TypeScript/JSX al vuelo. En producción, empaqueta todo con Rollup: combina módulos, elimina código no usado (tree-shaking) y divide el resultado en chunks (code-splitting) para cargar solo lo necesario por ruta.

```bash
npm create vite@latest mi-app -- --template vanilla
cd mi-app && npm install && npm run dev   # servidor de desarrollo
npm run build                              # build de producción optimizado
```

## Tree-shaking en la práctica

```js
import { debounce } from "lodash-es"; // solo esta función entra al bundle final
// import _ from "lodash";            // esto sí incluiría la librería completa
```

El tree-shaking solo funciona de forma confiable con ESM, porque el bundler puede analizar estáticamente qué exports se usan realmente.
