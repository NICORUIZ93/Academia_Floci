# Módulo 7: Gestión de estado global


## Aprende construyendo

### Tema 1: Zustand — stores mínimos sin boilerplate

**Conceptos clave:** `create`, suscripción selectiva, sin Provider obligatorio.

Zustand crea un store global mediante una única función `create((set, get) => ({...}))`, donde `set` actualiza el estado (de forma similar en espíritu a un setter de `useState` pero operando sobre un store compartido fuera del árbol de componentes) y `get` lee el estado actual dentro de las propias acciones del store (`total: () => get().items.reduce((s, i) => s + i.precio, 0)`), sin requerir ningún `Provider` envolvente en el árbol de componentes (a diferencia de Context, Módulo 4, que exige un Provider explícito para que sus consumidores funcionen).

La característica más importante de Zustand para el rendimiento es la suscripción selectiva: `const items = useCarrito(state => state.items)` suscribe al componente únicamente a la porción específica del store que la función selectora extrae (`state.items`), re-renderizando ese componente solo cuando esa porción específica cambia, no ante cualquier cambio en cualquier otra parte del store, resolviendo directamente el problema de granularidad de re-render que Context tiene (Módulo 4, Tema 2), donde cualquier consumidor se re-renderiza ante cualquier cambio del valor completo provisto, sin distinción de qué porción específica cambió.

**Analogía:** Zustand es como un tablero de anuncios central donde cada persona puede suscribirse específicamente solo a la sección del tablero que le interesa, notificándose únicamente cuando esa sección específica cambia, en vez de recibir una notificación cada vez que cualquier sección del tablero completo se actualiza.

**¿Por qué es importante?** La suscripción selectiva de Zustand evita re-renders innecesarios de componentes que no dependen de la porción específica del estado que cambió, un problema que Context no resuelve de forma nativa.

**Código del ejemplo:**

```jsx
const useCarrito = create((set, get) => ({
  items: [],
  agregar: (item) => set(state => ({ items: [...state.items, item] })),
  total: () => get().items.reduce((s, i) => s + i.precio, 0),
}));

function Carrito() {
  const items = useCarrito(state => state.items); // solo re-renderiza si `items` cambia
  return <ul>{items.map(i => <li key={i.id}>{i.nombre}</li>)}</ul>;
}
```

### Tema 2: Redux Toolkit — slices y ceremonia

**Conceptos clave:** `createSlice`, Immer para mutación segura, comparación de ceremonia con Zustand.

Redux Toolkit es la forma moderna y recomendada de usar Redux, reduciendo drásticamente el boilerplate del Redux clásico (que requería definir manualmente constantes de action types, creadores de actions, y reducers con switch statements extensos): `createSlice({ name: 'carrito', initialState: { items: [] }, reducers: { agregar: (state, action) => { state.items.push(action.payload); } } })` genera automáticamente los creadores de actions y el reducer correspondiente a partir de una única definición declarativa, y crucialmente usa Immer internamente, permitiendo escribir código que "parece" mutar el estado directamente (`state.items.push(...)`) mientras Immer, por debajo, produce en realidad un nuevo objeto de estado inmutable, preservando la garantía de inmutabilidad que Redux requiere sin que el desarrollador tenga que escribir manualmente el spread de objetos y arreglos.

A pesar de esta reducción significativa de boilerplate respecto al Redux clásico, Redux Toolkit sigue trayendo más ceremonia estructural que Zustand para el mismo caso de uso: un store de Redux Toolkit requiere definir slices, configurar un store central, y envolver la aplicación con un `Provider` de Redux, mientras que el mismo carrito implementado con Zustand (Tema 1) es una única función `create()` sin ninguna infraestructura adicional, reflejando la misma relación de ceremonia frente a beneficio estudiada para NgRx frente a un store de signals en el Módulo 9 del track de Angular: Redux Toolkit se justifica cuando el proyecto necesita las herramientas de depuración de historial (Redux DevTools), RTK Query para gestión de datos del servidor integrada, o un patrón único obligatorio en un equipo grande.

**Analogía:** Redux Toolkit es como un sistema de contabilidad corporativo con procedimientos estandarizados y auditoría integrada, considerablemente más simple que la contabilidad manual tradicional (Redux clásico) pero todavía más formal y estructurado que llevar las cuentas en una libreta simple (Zustand).

**¿Por qué es importante?** Redux Toolkit reduce drásticamente el boilerplate del Redux clásico mediante `createSlice` e Immer, pero sigue trayendo más ceremonia estructural que Zustand, justificada cuando se necesitan sus herramientas de depuración o su ecosistema (RTK Query).

**Código del ejemplo:**

```jsx
const carritoSlice = createSlice({
  name: 'carrito',
  initialState: { items: [] },
  reducers: {
    agregar: (state, action) => { state.items.push(action.payload); }, // Immer permite "mutar" de forma segura
  },
});
```

### Tema 3: Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto

**Conceptos clave:** separación de responsabilidades entre TanStack Query y estado global, sobre-ingeniería evitable.

El estado de servidor (datos que provienen de una API externa, sujetos a expiración, necesitados de revalidación periódica, y potencialmente compartidos entre múltiples usuarios simultáneos) pertenece conceptualmente a TanStack Query (Módulo 6), que ya resuelve cache, invalidación y refetch específicamente para ese tipo de estado; el estado de cliente puro (si un modal está abierto, qué pestaña está activa, el tema visual seleccionado) pertenece a Zustand, Context, o simplemente `useState` local, dado que ese estado no tiene ningún origen ni necesidad de sincronización con un servidor externo.

Mezclar ambos tipos de estado en el mismo store (por ejemplo, guardar tanto la lista de tareas obtenida de una API como el estado de si un modal está abierto en el mismo store de Zustand) suele complicar innecesariamente ambos casos: el estado de servidor terminaría reimplementando manualmente (de forma más pobre) la cache, invalidación y revalidación que TanStack Query ya ofrece de fábrica, mientras que el estado de cliente puro no se beneficia en nada de vivir junto a datos de red que tienen un ciclo de vida completamente distinto.

Finalmente, una parte importante de gestión de estado con criterio es reconocer cuándo ninguna librería de estado global es necesaria en absoluto: si el estado relevante solo se usa dentro de un único componente (o un componente y sus hijos directos, pasables cómodamente vía props), introducir Zustand, Redux, o incluso Context es sobre-ingeniería que agrega indirección sin ningún beneficio real; `useState` local sigue siendo, en la inmensa mayoría de los casos, la herramienta correcta por defecto.

**Analogía:** mezclar estado de servidor y de cliente en el mismo store es como guardar en el mismo cajón tanto la correspondencia que llega diariamente del exterior (que necesita revisarse y actualizarse constantemente) como los objetos personales fijos que nunca cambian, complicando la gestión de ambos innecesariamente; reconocer cuándo no se necesita ninguna librería es como no instalar un sistema de gestión de inventario completo para organizar tres objetos personales en un cajón.

**¿Por qué es importante?** Separar claramente estado de servidor (TanStack Query) de estado de cliente (Zustand/Context/`useState`) evita reimplementar manualmente capacidades que TanStack Query ya ofrece, y evita complicar estado de cliente simple con infraestructura innecesaria; reconocer cuándo ningún estado global es necesario evita sobre-ingeniería.

**Diagrama:**

```
Estado de servidor (API, cache, expiración) → TanStack Query
Estado de cliente puro (modal abierto, tema) → Zustand / Context / useState local
Estado usado en un único componente → useState local, sin ninguna librería global
```

### Tema 4: Jotai, Recoil y XState como alternativas

**Conceptos clave:** modelo atómico frente a store centralizado, máquinas de estado explícitas.

Jotai modela el estado global como átomos independientes y pequeños (`const contadorAtom = atom(0)`) en vez de un único store centralizado grande, permitiendo componer átomos derivados a partir de otros átomos de forma similar en espíritu a `computed()` de signals (Módulo 2 del track de Angular), con una granularidad de suscripción naturalmente fina dado que cada átomo es independiente por diseño; Recoil ofrece un modelo conceptualmente similar basado en "atoms" y "selectors" (valores derivados memoizados), aunque con menor adopción activa actualmente que Jotai en el ecosistema.

XState modela estado como una máquina de estados finitos explícita, con estados nombrados y transiciones explícitamente definidas entre ellos (por ejemplo, un estado "inactivo" que solo puede transicionar a "cargando" ante cierto evento, que a su vez solo puede transicionar a "éxito" o "error"), apropiado específicamente para flujos con reglas de transición complejas y estrictas donde ciertos estados simplemente no deberían ser alcanzables desde ciertos otros estados, una garantía estructural que un simple `useState`/`useReducer` no impone por sí solo (nada impide, en un reducer simple, escribir una transición de estado lógicamente inválida por error, mientras que una máquina de estados de XState rechaza explícitamente transiciones no definidas).

**Analogía:** Jotai es como gestionar el inventario mediante etiquetas individuales pequeñas e independientes en cada producto, en vez de un único gran libro de inventario centralizado; XState es como un diagrama de flujo estricto de un proceso de fábrica, donde cada estación solo puede recibir el producto desde ciertas estaciones anteriores específicas, rechazando explícitamente cualquier secuencia de transición no contemplada en el diagrama.

**¿Por qué es importante?** Jotai/Recoil ofrecen un modelo atómico con granularidad fina por diseño; XState aporta garantías estructurales sobre qué transiciones de estado son válidas, apropiado para flujos con reglas de transición complejas y estrictas.

**Diagrama:**

```
Jotai: átomos independientes, composición fina (similar a signals/computed)
XState: estados nombrados + transiciones explícitas, rechaza transiciones no definidas
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un carrito de compras con Zustand, y la misma funcionalidad con Redux Toolkit para comparar.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear el store de Zustand del carrito | Ver Tema 1 | `items`, `agregar`, `quitar`, `total` |
| 2 | Consumirlo desde dos componentes no relacionados | Ver Tema 1 | Verifica la suscripción selectiva |
| 3 | Implementar el mismo carrito con Redux Toolkit | Ver Tema 2 | Compara la cantidad de código |
| 4 | Clasificar el estado de tu propio proyecto | Ver Tema 3 | Servidor (TanStack Query) vs cliente (Zustand) |

**Verificación:** el laboratorio se considera exitoso si ambos componentes reflejan el mismo estado del carrito de Zustand en tiempo real, y si puedes explicar concretamente la diferencia de ceremonia entre la implementación de Zustand y la de Redux Toolkit.

**Errores comunes y soluciones**

- **Mezclar estado de servidor y de cliente en el mismo store.** Sepáralos: TanStack Query para servidor, Zustand/Context para cliente.
- **Introducir Zustand o Redux para estado usado en un único componente.** Usa `useState` local en ese caso.
- **Suscribirse al store completo en vez de seleccionar la porción específica necesaria.** Usa una función selectora (`state => state.items`) para limitar los re-renders.

---
