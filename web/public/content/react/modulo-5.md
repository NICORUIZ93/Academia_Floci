# Módulo 5: React Router — navegación


## Aprende construyendo

### Tema 1: Rutas anidadas y layouts compartidos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás crear navegación React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, el seguimiento tiene lista, detalle y administración; cada ruta debe cargar sus datos, proteger permisos y permitir volver atrás.

#### Paso 3 · Teoría, modelo mental y analogía
Un router relaciona URL con árbol de componentes; layouts comparten estructura; loaders preparan datos y code-splitting reduce carga inicial. Una ruta protegida mejora UX, pero la autorización real vive en servidor. La analogía es un edificio con pasillos, recepción y puertas, pero cada puerta también se verifica internamente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m5
cd ejemplo-react-m5
npm create vite@latest app -- --template react-ts
cd app
npm install react-router-dom
npm run dev
```
Crea src/routes.tsx con layout, ruta /deliveries/:id y loader; muestra loading, error y datos.

#### Paso 5 · Práctica guiada
Pista: apunta deliberadamente el loader a una URL inexistente para provocar un fallo deliberado; observa la pantalla de error y corrígela. Resultado esperado: navegación con estado explícito.

#### Paso 6 · Práctica independiente
Añade ruta protegida, lazy import, 404, query params y prueba de recarga directa en servidor estático.

#### Paso 7 · Cierre y evidencia
Guarda mapa de rutas, capturas, log y bundle; como siguiente paso estudia datos remotos. Errores comunes: auth solo en cliente, loaders sin cancelación, rutas ambiguas y servidor sin fallback. Fuentes oficiales: https://reactrouter.com/home y https://react.dev/learn.
**¿Por qué es importante?** Porque la navegación es un contrato de producto y rendimiento.
**Evidencia de aprendizaje:** entrega rutas, loader, error, lazy chunk y protección; explica el resultado y conserva la salida.
**Conceptos clave:** `children`, layout compartido, composición de rutas.

React Router permite definir rutas anidadas mediante la propiedad `children` de una configuración de ruta: una ruta padre (`/tareas`) puede definir un `element` que actúa como layout compartido (por ejemplo, una barra de navegación común a todas las sub-rutas), dentro del cual se renderizan sus rutas hijas (`{ index: true, element: <ListaTareas /> }` para la ruta exacta `/tareas`, y `{ path: ':id', element: <DetalleTarea /> }` para `/tareas/:id`), evitando la necesidad de repetir manualmente ese layout compartido (la navbar, por ejemplo) en cada componente de vista individual.

Esta estructura anidada refleja directamente la jerarquía visual real de la aplicación: si todas las vistas bajo `/tareas/*` comparten la misma barra de navegación circundante, expresar esa relación mediante anidamiento de rutas evita duplicar ese layout en cada componente de vista, centralizándolo en un único lugar (el componente de la ruta padre), de forma conceptual similar al routing anidado con layouts compartidos estudiado en el Módulo 4 del track de Angular, aunque expresado con la API específica de React Router en vez de la de Angular Router.

**Analogía:** un layout compartido en rutas anidadas es como un marco de fotos común que envuelve distintas fotos intercambiables: el marco (la navbar) permanece igual, mientras que el contenido específico dentro de él (la vista actual) cambia según la ruta activa.

**¿Por qué es importante?** Anidar rutas bajo un layout compartido centraliza ese layout en un único lugar, evitando duplicarlo manualmente en cada componente de vista individual.

**Código del ejemplo:**

```jsx
const router = createBrowserRouter([
  {
    path: '/tareas',
    element: <LayoutTareas />, // navbar compartida
    children: [
      { index: true, element: <ListaTareas /> },
      { path: ':id', element: <DetalleTarea /> },
    ],
  },
]);
```

### Tema 2: Loaders — datos antes de renderizar

#### Paso 1 · Objetivo y preparación
Al finalizar podrás crear navegación React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, el seguimiento tiene lista, detalle y administración; cada ruta debe cargar sus datos, proteger permisos y permitir volver atrás.

#### Paso 3 · Teoría, modelo mental y analogía
Un router relaciona URL con árbol de componentes; layouts comparten estructura; loaders preparan datos y code-splitting reduce carga inicial. Una ruta protegida mejora UX, pero la autorización real vive en servidor. La analogía es un edificio con pasillos, recepción y puertas, pero cada puerta también se verifica internamente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m5
cd ejemplo-react-m5
npm create vite@latest app -- --template react-ts
cd app
npm install react-router-dom
npm run dev
```
Crea src/routes.tsx con layout, ruta /deliveries/:id y loader; muestra loading, error y datos.

#### Paso 5 · Práctica guiada
Pista: apunta deliberadamente el loader a una URL inexistente para provocar un fallo deliberado; observa la pantalla de error y corrígela. Resultado esperado: navegación con estado explícito.

#### Paso 6 · Práctica independiente
Añade ruta protegida, lazy import, 404, query params y prueba de recarga directa en servidor estático.

#### Paso 7 · Cierre y evidencia
Guarda mapa de rutas, capturas, log y bundle; como siguiente paso estudia datos remotos. Errores comunes: auth solo en cliente, loaders sin cancelación, rutas ambiguas y servidor sin fallback. Fuentes oficiales: https://reactrouter.com/home y https://react.dev/learn.
**¿Por qué es importante?** Porque la navegación es un contrato de producto y rendimiento.
**Evidencia de aprendizaje:** entrega rutas, loader, error, lazy chunk y protección; explica el resultado y conserva la salida.
**Conceptos clave:** carga de datos previa a la vista, `useLoaderData`, evitar el parpadeo de carga.

Un loader es una función asociada a una ruta específica que React Router ejecuta y espera a que complete antes de renderizar el componente de esa ruta: `loader: ({ params }) => fetch(`/api/tareas/${params.id}`)`, con el componente accediendo al resultado de esa carga mediante `useLoaderData()`, en vez de disparar la carga de datos dentro de un `useEffect` una vez que el componente ya se montó (el patrón tradicional de fetching dentro del propio componente).

Esta diferencia de timing es la ventaja concreta de un loader: con fetching dentro de un `useEffect`, el componente se monta primero (típicamente mostrando algún estado de "cargando..." mientras la petición está en curso), y solo después de que la petición completa se actualiza el estado con los datos reales, produciendo un parpadeo visual perceptible entre el estado vacío/cargando inicial y el contenido final; con un loader, React Router espera a que la carga de datos complete antes de montar el componente en absoluto, evitando ese parpadeo intermedio por completo, dado que el componente nunca se renderiza en un estado sin datos.

**Analogía:** un loader es como esperar a que el plato completo esté listo en la cocina antes de servirlo en la mesa; fetching dentro de un `useEffect` es como servir la mesa vacía primero y traer el plato después, dejando al comensal esperando frente a un plato vacío durante un momento perceptible antes de que llegue el contenido real.

**¿Por qué es importante?** Un loader evita el parpadeo de un estado intermedio "cargando" al asegurar que los datos ya están disponibles antes de que el componente de la ruta se renderice por primera vez.

**Código del ejemplo:**

```jsx
{
  path: '/tareas/:id',
  loader: ({ params }) => fetch(`/api/tareas/${params.id}`),
  element: <DetalleTarea />,
}
// dentro del componente:
const tarea = useLoaderData();
```

### Tema 3: Rutas protegidas y code-splitting por ruta

#### Paso 1 · Objetivo y preparación
Al finalizar podrás crear navegación React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, el seguimiento tiene lista, detalle y administración; cada ruta debe cargar sus datos, proteger permisos y permitir volver atrás.

#### Paso 3 · Teoría, modelo mental y analogía
Un router relaciona URL con árbol de componentes; layouts comparten estructura; loaders preparan datos y code-splitting reduce carga inicial. Una ruta protegida mejora UX, pero la autorización real vive en servidor. La analogía es un edificio con pasillos, recepción y puertas, pero cada puerta también se verifica internamente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m5
cd ejemplo-react-m5
npm create vite@latest app -- --template react-ts
cd app
npm install react-router-dom
npm run dev
```
Crea src/routes.tsx con layout, ruta /deliveries/:id y loader; muestra loading, error y datos.

#### Paso 5 · Práctica guiada
Pista: apunta deliberadamente el loader a una URL inexistente para provocar un fallo deliberado; observa la pantalla de error y corrígela. Resultado esperado: navegación con estado explícito.

#### Paso 6 · Práctica independiente
Añade ruta protegida, lazy import, 404, query params y prueba de recarga directa en servidor estático.

#### Paso 7 · Cierre y evidencia
Guarda mapa de rutas, capturas, log y bundle; como siguiente paso estudia datos remotos. Errores comunes: auth solo en cliente, loaders sin cancelación, rutas ambiguas y servidor sin fallback. Fuentes oficiales: https://reactrouter.com/home y https://react.dev/learn.
**¿Por qué es importante?** Porque la navegación es un contrato de producto y rendimiento.
**Evidencia de aprendizaje:** entrega rutas, loader, error, lazy chunk y protección; explica el resultado y conserva la salida.
**Conceptos clave:** redirección condicional según autenticación, `React.lazy` + `Suspense`, chunks separados.

Una ruta protegida verifica, antes de mostrar su contenido real, si el usuario cumple una condición de acceso (típicamente estar autenticado):

```jsx
function RutaProtegida({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" />;
}
```

Este componente envolvente renderiza condicionalmente su contenido protegido o redirige a la ruta de login, conceptualmente equivalente a un guard funcional de Angular (`CanActivateFn`, Módulo 4 del track de Angular), aunque expresado aquí como un componente de React en vez de una función dedicada del sistema de routing.

`React.lazy(() => import('./Configuracion'))` marca un componente para que su código se compile en un chunk de JavaScript separado del bundle principal, descargado únicamente cuando efectivamente se necesita renderizar (cuando el usuario navega a la ruta correspondiente), reduciendo el tamaño del bundle inicial que se descarga al cargar la aplicación por primera vez; `<Suspense fallback={<Spinner />}>` envuelve ese componente perezoso, mostrando el `fallback` mientras el chunk correspondiente todavía se está descargando, de forma conceptualmente equivalente al `@defer`/`@placeholder` de Angular (Módulo 11 del track de Angular), aunque aplicado aquí específicamente a la carga perezosa de componentes completos de ruta en vez de a bloques arbitrarios de una plantilla.

**Analogía:** una ruta protegida es como un guardia en la entrada de una sala que verifica una credencial antes de permitir el paso, redirigiendo a otra sala (login) a quien no la presente; el code-splitting por ruta es como no llevar contigo el manual completo de todas las salas del edificio, sino recibir solo el manual específico de la sala a la que efectivamente entras, en el momento en que entras a ella.

**¿Por qué es importante?** Las rutas protegidas centralizan la lógica de redirección según autenticación; el code-splitting por ruta reduce el bundle inicial descargado, mejorando el tiempo de carga inicial de la aplicación.

**Código del ejemplo:**

```jsx
function RutaProtegida({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" />;
}

const Configuracion = lazy(() => import('./Configuracion'));
<Route path="/config" element={
  <Suspense fallback={<Spinner />}><Configuracion /></Suspense>
} />
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una aplicación con rutas anidadas, un loader, una ruta protegida y carga perezosa.

**Requisitos previos:** Módulos 0-4 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir rutas anidadas con layout compartido | Ver Tema 1 | `/tareas` con hijas `index` y `:id` |
| 2 | Agregar un loader a la ruta de detalle | Ver Tema 2 | Verifica que evita el parpadeo de carga |
| 3 | Implementar la ruta protegida | Ver Tema 3 | Redirige a `/login` sin sesión |
| 4 | Cargar una ruta pesada con `React.lazy` | Ver Tema 3 | Verifica en Network que el chunk se descarga solo al navegar ahí |

**Verificación:** el laboratorio se considera exitoso si la navegación entre rutas anidadas mantiene el layout compartido sin remontarlo, si la ruta con loader no muestra ningún parpadeo de carga, y si el chunk de la ruta perezosa se descarga únicamente al navegar hacia ella (verificable en la pestaña Network).

**Errores comunes y soluciones**

- **Duplicar el layout en cada componente de vista en vez de anidar rutas.** Usa una ruta padre con `children` para compartir el layout.
- **Hacer fetching dentro de un `useEffect` cuando un loader evitaría el parpadeo.** Prefiere un loader para datos necesarios antes de mostrar la vista.
- **Olvidar envolver un componente `lazy` en `Suspense`.** Sin `Suspense`, React no sabe qué mostrar mientras el chunk se descarga.

---
