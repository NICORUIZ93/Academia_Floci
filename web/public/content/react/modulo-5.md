# Módulo 5: React Router — navegación

## Sílabo

**Objetivo general**

Estructurar una Single Page Application con múltiples vistas, rutas anidadas con layouts compartidos, carga de datos previa a la renderización, rutas protegidas y code-splitting por ruta.

**Objetivos específicos**

1. Definir rutas anidadas con un layout compartido.
2. Usar un loader de React Router para cargar datos antes de renderizar.
3. Implementar una ruta protegida que redirija según el estado de autenticación.
4. Aplicar code-splitting por ruta con `React.lazy` y `Suspense`.
5. Explicar la ventaja de un loader frente a un `useEffect` de fetching dentro del componente.

**Contenido**

- Rutas anidadas y layouts compartidos.
- Loaders y acciones de datos.
- Rutas protegidas.
- Code-splitting por ruta.

**Evaluación**

Aplicación con rutas anidadas, una ruta protegida y carga perezosa de al menos una vista, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Rutas anidadas y layouts compartidos

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

**Conceptos clave:** redirección condicional según autenticación, `React.lazy` + `Suspense`, chunks separados.

Una ruta protegida verifica, antes de mostrar su contenido real, si el usuario cumple una condición de acceso (típicamente estar autenticado): `function RutaProtegida({ children }) { const { autenticado } = useAuth(); return autenticado ? children : <Navigate to="/login" />; }`, un componente envolvente que renderiza condicionalmente su contenido protegido o redirige a la ruta de login, conceptualmente equivalente a un guard funcional de Angular (`CanActivateFn`, Módulo 4 del track de Angular), aunque expresado aquí como un componente de React en vez de una función dedicada del sistema de routing.

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

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

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

## Ejercicios de evaluación

### Ejercicio 1: Ventaja de un loader

**Enunciado:** explica qué ventaja da un loader de ruta frente a hacer fetch dentro de un `useEffect` del componente.

**Solución esperada:** el loader completa la carga de datos antes de que el componente se renderice por primera vez, evitando el parpadeo visual de un estado intermedio "cargando" que ocurriría si el fetch se disparara dentro de un `useEffect` después de que el componente ya se montó.

**Criterios de éxito:**
- Explica correctamente la diferencia de timing y el parpadeo evitado.

### Ejercicio 2: Code-splitting y tiempo de carga inicial

**Enunciado:** ¿por qué el code-splitting por ruta mejora el tiempo de carga inicial de la aplicación?

**Solución esperada:** sin code-splitting, el bundle inicial incluiría el código de todas las rutas de la aplicación, incluso las que el usuario podría nunca visitar en esa sesión; con code-splitting, cada ruta se compila en un chunk separado, descargado únicamente cuando el usuario efectivamente navega a esa ruta, reduciendo el tamaño del bundle inicial descargado.

**Criterios de éxito:**
- Explica correctamente la reducción del bundle inicial al diferir el código de rutas no visitadas todavía.

### Ejercicio 3: Rutas protegidas

**Enunciado:** ¿qué patrón conceptualmente equivalente a una ruta protegida de React Router existe en Angular Router?

**Solución esperada:** un guard funcional `CanActivateFn` (Módulo 4 del track de Angular), que también verifica una condición de acceso antes de permitir la navegación a una ruta, redirigiendo si la condición no se cumple, aunque implementado como una función dedicada del sistema de routing en vez de un componente envolvente como en React Router.

**Criterios de éxito:**
- Identifica correctamente `CanActivateFn` como el equivalente conceptual en Angular.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Meta Open Source, *React Documentation*.
- WHATWG, estándares de DOM, HTML y Fetch.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Las rutas anidadas con un layout compartido centralizan ese layout evitando duplicarlo por vista.
- Un loader evita el parpadeo de un estado intermedio "cargando" al completar la carga antes de renderizar.
- Una ruta protegida centraliza la lógica de redirección según el estado de autenticación.
- El code-splitting por ruta con `React.lazy` + `Suspense` reduce el bundle inicial descargado.

**Conceptos aprendidos**

- Rutas anidadas y layouts compartidos.
- Loaders y `useLoaderData`.
- Rutas protegidas.
- Code-splitting por ruta.

**Próximos pasos**

En el Módulo 6 aprenderás data fetching moderno con TanStack Query: queries, mutations, cache e invalidación.

**Recursos adicionales**

- Documentación oficial de React Router (reactrouter.com): "Data Loading" y "Lazy Loading Routes".
