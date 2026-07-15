# Módulo 12: Proyecto integrador — SPA con datos reales

## Sílabo

**Objetivo general**

Construir una Single Page Application completa en React y TypeScript que integre arquitectura por features, estado de servidor con TanStack Query, rutas protegidas con layouts, un store de Zustand exclusivamente para estado de UI, y tests de los flujos críticos.

**Objetivos específicos**

1. Organizar el proyecto por features en vez de por tipo de archivo.
2. Implementar rutas protegidas con React Router y un layout compartido.
3. Conectar TanStack Query a una API real con queries y mutations.
4. Separar estado de UI puro en un store de Zustand, sin mezclarlo con estado de servidor.
5. Escribir tests con Testing Library + MSW del flujo crítico de la aplicación.

**Contenido**

- Estructura del proyecto integrador.
- Integración de rutas, estado de servidor y estado de cliente.
- `useTareas`: hook con TanStack Query.
- Cierre del track: la separación cliente/servidor como decisión clave.

**Evaluación**

Construcción completa de la SPA descrita, más tres ejercicios de evaluación de cierre.

---

## Contenido teórico

### Tema 1: Estructura del proyecto integrador

**Conceptos clave:** organización por feature, separación entre `features/` y `store/`.

Siguiendo el principio de organización por feature (el mismo criterio aplicado en el proyecto integrador de Angular, Módulo 13 del track de Angular), el proyecto se estructura en `features/tareas/` (con `ListaTareas.tsx` para la vista y `useTareas.ts` como hook dedicado que encapsula el acceso a datos con TanStack Query) y `features/auth/` (con `RutaProtegida.tsx` y `useAuth.ts`), manteniendo separadas las responsabilidades de dominio de gestión de tareas y de autenticación, comunicándose entre sí únicamente a través de puntos de integración explícitos, exactamente el mismo criterio de cohesión estudiado en profundidad en el Módulo 8 del track de Angular.

`store/uiStore.ts`, un store de Zustand (Módulo 7) reservado exclusivamente para estado de interfaz puro (por ejemplo, si la barra lateral está abierta o cerrada), vive deliberadamente separado de la lógica de datos de cada feature, reflejando la separación estudiada en el Módulo 7 entre estado de servidor (que pertenece a los hooks de TanStack Query dentro de cada feature) y estado de cliente puro (que pertenece a este store dedicado, sin mezclarse con datos de red).

**Analogía:** la estructura del proyecto integrador es como una empresa con departamentos claramente delimitados por función (tareas, autenticación) más una oficina central separada que gestiona únicamente aspectos generales de la instalación (como si las luces de cierta sección están encendidas), sin que esa oficina central se entrometa en la lógica de negocio específica de cada departamento.

**¿Por qué es importante?** Separar features por dominio, y aislar el estado de UI puro en un store dedicado sin mezclarlo con datos de servidor, mantiene el proyecto comprensible y evita las complicaciones de mezclar tipos de estado con ciclos de vida y necesidades completamente distintas.

**Diagrama:**

```
src/
  features/
    tareas/
      ListaTareas.tsx
      useTareas.ts        ← hook con TanStack Query
    auth/
      RutaProtegida.tsx
      useAuth.ts
  store/
    uiStore.ts             ← Zustand, solo estado de cliente
  router.tsx
```

### Tema 2: Integrando rutas, TanStack Query y Zustand

**Conceptos clave:** rutas protegidas con layout, estado de servidor centralizado en un hook dedicado.

`RutaProtegida` (Módulo 5) envuelve las rutas de la feature de tareas, verificando la sesión activa mediante `useAuth` antes de permitir el acceso, redirigiendo a `/login` en caso contrario; el layout compartido de esas rutas (con la navegación común) se define una única vez en la configuración de rutas anidadas, evitando duplicarlo en cada vista individual de la feature de tareas.

`useTareas()` (Tema 3) encapsula completamente el acceso a datos de tareas detrás de un hook dedicado de la feature, de modo que los componentes de vista (`ListaTareas.tsx`) simplemente invocan ese hook sin necesidad de conocer los detalles de `queryKey`, `queryFn`, ni la configuración específica de TanStack Query subyacente, un nivel de abstracción que hace que la lógica de acceso a datos sea reemplazable o modificable (por ejemplo, cambiando el endpoint real consultado) sin tocar el código de los componentes de vista que simplemente consumen el resultado del hook.

El store de Zustand (`uiStore.ts`) se consume únicamente para estado de interfaz pura, como si la barra lateral está abierta, completamente desacoplado de `useTareas`, que gestiona su propio ciclo de cache, invalidación y refetch de forma independiente mediante TanStack Query, sin ninguna interferencia entre ambos sistemas de estado.

**Analogía:** integrar estas piezas es como coordinar la entrada de seguridad de un edificio (la ruta protegida), un departamento de datos centralizado que sabe cómo consultar y actualizar información real (el hook `useTareas`), y un panel de control de instalaciones generales completamente separado (el store de Zustand para UI), cada uno operando de forma independiente pero coordinada a través de puntos de integración claros.

**¿Por qué es importante?** Encapsular el acceso a datos detrás de un hook dedicado por feature hace que la lógica de datos sea reemplazable sin afectar los componentes de vista; mantener el estado de UI completamente separado del estado de servidor evita interferencias entre ambos sistemas.

**Diagrama:**

```
RutaProtegida (useAuth) → protege las rutas de tareas con layout compartido
ListaTareas.tsx → consume useTareas() → TanStack Query gestiona cache/invalidación
uiStore.ts (Zustand) → solo estado de UI pura, desacoplado de useTareas
```

### Tema 3: useTareas — hook dedicado con TanStack Query

**Conceptos clave:** encapsular queryKey y queryFn detrás de un hook con nombre significativo.

`useTareas()` envuelve `useQuery<Tarea[]>({ queryKey: ['tareas'], queryFn: () => fetch('/api/tareas').then(r => r.json()) })` dentro de un hook con nombre significativo específico del dominio, en vez de que cada componente que necesita la lista de tareas invoque `useQuery` directamente con su propia `queryKey` y `queryFn` repetidas en cada punto de uso: esta encapsulación centraliza en un único lugar cualquier cambio futuro relacionado con cómo se obtienen las tareas (el endpoint exacto, headers adicionales necesarios, transformación de la respuesta), sin tener que modificar cada componente individual que consume esos datos.

Esta misma técnica se extiende naturalmente a mutaciones relacionadas (por ejemplo, un `useCrearTarea()` complementario que envuelva `useMutation` con su propia invalidación configurada), construyendo así una capa de hooks específicos del dominio de tareas que actúa como la única interfaz pública entre los componentes de la feature y TanStack Query, reflejando el mismo principio de encapsulación de acceso a datos estudiado para `TareasStore` en el Módulo 13 del track de Angular, aunque aquí implementado como hooks de React en vez de un servicio inyectable de Angular.

**Analogía:** `useTareas` es como un mostrador de atención específico para consultas sobre tareas, al que cualquier parte de la aplicación puede acudir sin necesidad de saber los detalles internos de cómo ese mostrador efectivamente obtiene la información solicitada del sistema central.

**¿Por qué es importante?** Encapsular `queryKey`/`queryFn` detrás de un hook con nombre significativo centraliza los detalles de acceso a datos en un único lugar, facilitando cambios futuros sin tocar cada componente consumidor individual.

**Diagrama:**

```tsx
function useTareas() {
  return useQuery<Tarea[]>({
    queryKey: ['tareas'],
    queryFn: () => fetch('/api/tareas').then(r => r.json()),
  });
}
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir la SPA integradora completa con rutas protegidas, TanStack Query, Zustand para UI, y tests del flujo crítico.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Organizar el proyecto por features | Ver Tema 1 | `tareas/`, `auth/` separados |
| 2 | Implementar rutas protegidas con layout | Ver Tema 2 | `RutaProtegida` + layout compartido |
| 3 | Conectar TanStack Query con `useTareas` | Ver Tema 3 | Queries y mutations encapsuladas |
| 4 | Agregar `uiStore` de Zustand solo para UI | Ver Tema 1 | Separado del estado de servidor |
| 5 | Escribir tests del flujo crítico | Módulo 8 | Testing Library + MSW |

**Verificación:** el laboratorio (y el track completo) se considera exitoso si la aplicación protege correctamente las rutas de tareas, si el estado de servidor y de UI permanecen completamente separados, y si los tests del flujo crítico pasan de forma determinista sin depender de red real.

**Errores comunes y soluciones**

- **Invocar `useQuery` directamente en cada componente en vez de encapsularlo en un hook dedicado.** Centraliza el acceso a datos en hooks como `useTareas`.
- **Mezclar estado de UI y de servidor en el mismo store.** Mantén `uiStore` exclusivamente para estado de interfaz pura.
- **Omitir tests del flujo crítico.** Prioriza probar el camino principal completo (login → ver tareas → crear tarea) sobre casos secundarios.

---

## Ejercicios de evaluación

### Ejercicio 1: Separación cliente/servidor como decisión arquitectónica

**Enunciado:** ¿qué decisión de arquitectura suele costar más definir en un proyecto React real: la separación de estado de cliente vs servidor, o la elección de un router?

**Solución esperada:** cualquier respuesta razonablemente justificada; la respuesta esperada más común es la separación de estado de cliente vs servidor, dado que requiere criterio continuo a lo largo de todo el desarrollo (cada nuevo pedazo de estado debe clasificarse correctamente), mientras que la elección de un router es una decisión puntual tomada una única vez al inicio del proyecto.

**Criterios de éxito:**
- Justifica su elección con un argumento coherente, sin limitarse a nombrar una opción sin explicación.

### Ejercicio 2: Impacto del ecosistema en la calidad del código

**Enunciado:** ¿qué parte del ecosistema React (TanStack Query, React Router, TypeScript) tuvo el mayor impacto en la calidad del código final de tu proyecto integrador?

**Solución esperada:** cualquier respuesta razonablemente justificada; una respuesta común y bien fundamentada señala TanStack Query por eliminar la gestión manual de loading/error/cache repetida en cada componente, o TypeScript por detectar errores de props y de forma de datos en tiempo de compilación antes de llegar a producción.

**Criterios de éxito:**
- Justifica la elección con un argumento concreto vinculado a un beneficio real observado durante la construcción del proyecto.

### Ejercicio 3: Encapsular acceso a datos en un hook dedicado

**Enunciado:** ¿qué beneficio concreto aporta encapsular `queryKey`/`queryFn` detrás de un hook como `useTareas` en vez de invocar `useQuery` directamente en cada componente?

**Solución esperada:** centraliza en un único lugar cualquier cambio futuro relacionado con cómo se obtienen los datos (endpoint, headers, transformación de la respuesta), sin necesidad de modificar cada componente individual que consume esos datos, además de dar un nombre significativo y específico del dominio a esa lógica de acceso a datos.

**Criterios de éxito:**
- Explica correctamente la centralización de cambios futuros como el beneficio principal.

---

## Resumen del módulo

**Puntos clave**

- El proyecto integrador organiza el código en features claramente separadas (`tareas/`, `auth/`) más un store de Zustand exclusivo para UI.
- Encapsular el acceso a datos en hooks dedicados (`useTareas`) centraliza los detalles de TanStack Query en un único lugar.
- La separación estricta entre estado de servidor y estado de cliente es la decisión arquitectónica que más simplifica una SPA React real.
- El proyecto demuestra la integración natural de todo el conjunto de habilidades estudiadas a lo largo del track.

**Conceptos aprendidos**

- Estructura de un proyecto real organizado por feature.
- Integración de rutas protegidas, TanStack Query y Zustand.
- Encapsulación del acceso a datos en hooks dedicados del dominio.

**Próximos pasos**

Con el track de React completo, estás preparado para construir, mantener y escalar SPAs y aplicaciones Next.js modernas, combinando hooks, arquitectura por features, data fetching con TanStack Query, estado global con criterio, y TypeScript.

**Recursos adicionales**

- Documentación oficial de React (react.dev) y de Next.js (nextjs.org/docs) como referencia continua para profundizar en cualquiera de los temas de este track.
