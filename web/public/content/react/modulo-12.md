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

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Construcción completa de la SPA descrita, más tres ejercicios de evaluación de cierre.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
npm create vite@latest academia-labs/react-app -- --template react-ts
cd academia-labs/react-app
npm install
git init
```

Trabaja dentro de `academia-labs/react-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/react-app/
├─ src/features/
│  └─ module-12/
├─ tests/
├─ docs/decisions/
├─ evidence/module-12/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Estructura del proyecto integrador | `src/features/module-12/topic-1-estructura-del-proyecto-integrador.tsx` | prueba + salida observable |
| 2. Integrando rutas, TanStack Query y Zustand | `src/features/module-12/topic-2-integrando-rutas-tanstack-query-y-zustand.tsx` | prueba + salida observable |
| 3. useTareas — hook dedicado con TanStack Query | `src/features/module-12/topic-3-usetareas-hook-dedicado-con-tanstack-query.tsx` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/react-app`:

```bash
npm test -- --run && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Construcción completa de la SPA descrita, más tres ejercicios de evaluación de cierre.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia una prop o respuesta a un caso vacío o erróneo; observa el estado visual y corrige desde la primera causa. Guarda en `evidence/module-12/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Proyecto integrador — SPA con datos reales** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

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

## Proyecto transversal RutaFlow: Seguimiento del cliente

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/react/use-shipment-tracking.tsx`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

El hook modela estados explícitos y cancela la petición cuando cambia el código o se desmonta la vista. `encodeURIComponent` protege la composición de URL, pero el servidor sigue validando. La interfaz renderiza skeleton, resultado, vacío y error; nunca muestra un error técnico ni conserva silenciosamente un envío anterior.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Prueba cambio rápido de código, aborto, 404, 500, respuesta tardía y recuperación. Añade actualización periódica o stream solo después de comprobar cleanup y consumo. Usa React Performance Tracks para medir, no `memo` por costumbre.

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.

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
