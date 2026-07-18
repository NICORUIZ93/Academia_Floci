# Módulo 6: Data fetching moderno

## Sílabo

**Objetivo general**

Dejar de manejar manualmente estados de loading/error/cache con `useState`/`useEffect`, adoptando TanStack Query como capa dedicada de gestión de datos del servidor.

**Objetivos específicos**

1. Reemplazar un fetching manual por `useQuery`.
2. Explicar cómo TanStack Query cachea, invalida y refresca datos.
3. Implementar una mutación con `useMutation` que invalide la query relacionada.
4. Implementar un optimistic update con reversión ante error.
5. Explicar qué problemas de "loading hell" resuelve TanStack Query.

**Contenido**

- TanStack Query: queries y mutations.
- Cache, invalidación y refetch.
- Estados de carga, error y datos obsoletos.
- Optimistic updates.

**Evaluación**

Lista de datos con fetching, cache y mutaciones optimistas usando TanStack Query, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Lista de datos con fetching, cache y mutaciones optimistas usando TanStack Query, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-6/
├─ tests/
├─ docs/decisions/
├─ evidence/module-6/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. useQuery y el problema que resuelve | `src/features/module-6/topic-1-usequery-y-el-problema-que-resuelve.tsx` | prueba + salida observable |
| 2. Mutations e invalidación | `src/features/module-6/topic-2-mutations-e-invalidacion.tsx` | prueba + salida observable |
| 3. Optimistic updates | `src/features/module-6/topic-3-optimistic-updates.tsx` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/react-app`:

```bash
npm test -- --run && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Lista de datos con fetching, cache y mutaciones optimistas usando TanStack Query, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia una prop o respuesta a un caso vacío o erróneo; observa el estado visual y corrige desde la primera causa. Guarda en `evidence/module-6/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Data fetching moderno** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: useQuery y el problema que resuelve

**Conceptos clave:** `queryKey`, deduplicación, refetch automático.

Manejar fetching manualmente con `useState` + `useEffect` (guardar el resultado, un booleano de carga, y un posible error, todo como estados separados sincronizados manualmente en cada componente que necesita datos de una API) es un patrón que se repite virtualmente idéntico en cada componente que consume datos remotos, y que además omite fácilmente casos importantes (deduplicación de peticiones idénticas simultáneas desde distintos componentes, revalidación automática cuando el usuario vuelve a la pestaña tras un tiempo ausente, cancelación de peticiones obsoletas) a menos que se implemente esa lógica adicional manualmente y de forma repetida en cada lugar.

`useQuery({ queryKey: ['tareas'], queryFn: () => fetch('/api/tareas').then(r => r.json()) })` reemplaza todo ese patrón manual con una única llamada declarativa: TanStack Query gestiona automáticamente el estado de `isLoading`, `error` y `data`, cachea el resultado bajo la clave `queryKey` proporcionada (permitiendo que múltiples componentes que usan la misma `queryKey` compartan automáticamente el mismo resultado cacheado sin disparar peticiones duplicadas), revalida automáticamente en segundo plano cuando la ventana del navegador recupera el foco (asumiendo que los datos podrían haber cambiado mientras el usuario estaba en otra pestaña), y deduplica peticiones idénticas simultáneas lanzadas por distintos componentes en el mismo instante, consolidándolas en una única petición de red real.

**Analogía:** manejar fetching manualmente con `useState`/`useEffect` en cada componente es como cada persona de una oficina llamando individualmente al mismo proveedor para pedir la misma información, sin coordinarse entre sí; TanStack Query es como un único departamento centralizado que recibe todas esas solicitudes, consulta al proveedor una única vez cuando es necesario, y distribuye la misma respuesta a quien la solicitó, evitando llamadas redundantes.

**¿Por qué es importante?** `useQuery` elimina el "loading hell" de gestionar manualmente estado de carga/error/cache en cada componente, y agrega automáticamente deduplicación, cache compartida y revalidación en segundo plano sin código adicional.

**Diagrama:**

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['tareas'],
  queryFn: () => fetch('/api/tareas').then(r => r.json()),
});
```

### Tema 2: Mutations e invalidación

**Conceptos clave:** `useMutation`, `invalidateQueries`, sincronización tras un cambio.

`useMutation` gestiona operaciones que modifican datos en el servidor (crear, actualizar, eliminar), a diferencia de `useQuery`, orientado a leer datos: `const crear = useMutation({ mutationFn: (tarea) => fetch('/api/tareas', { method: 'POST', body: JSON.stringify(tarea) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tareas'] }) })` ejecuta la petición de creación, y al completarse exitosamente, invalida la query de la lista de tareas (marcándola como obsoleta y disparando automáticamente un refetch de esa query), garantizando que la lista mostrada en pantalla refleje el nuevo elemento recién creado sin que el componente que muestra la lista necesite saber explícitamente que ocurrió una creación en otro lugar de la aplicación.

Esta invalidación explícita tras una mutación exitosa es el mecanismo estándar de sincronización entre escrituras y lecturas en TanStack Query: en vez de actualizar manualmente la cache local con el resultado exacto devuelto por la mutación (un enfoque posible pero propenso a desincronizarse sutilmente de lo que el servidor realmente tiene), invalidar y dejar que TanStack Query vuelva a solicitar los datos reales garantiza que la vista siempre refleje el estado verdadero del servidor tras el cambio, al costo de una petición de red adicional para refrescar esa query invalidada.

**Analogía:** invalidar una query tras una mutación es como avisar a un departamento de inventario que se acaba de agregar un producto nuevo, provocando que ese departamento recuente y actualice su registro completo, en vez de simplemente confiar en anotar manualmente el cambio sin verificar que el recuento real coincide.

**¿Por qué es importante?** Invalidar la query relacionada tras una mutación exitosa garantiza que la vista refleje el estado real y actualizado del servidor, sin necesidad de sincronizar manualmente la cache local con el resultado exacto de cada mutación.

**Diagrama:**

```jsx
const queryClient = useQueryClient();
const crear = useMutation({
  mutationFn: (tarea) => fetch('/api/tareas', { method: 'POST', body: JSON.stringify(tarea) }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tareas'] }), // refetch automático
});
```

### Tema 3: Optimistic updates

**Conceptos clave:** actualizar la UI antes de la confirmación del servidor, revertir ante error.

Un optimistic update actualiza la interfaz inmediatamente con el resultado esperado de una mutación, antes incluso de que el servidor confirme que esa operación efectivamente se completó exitosamente, mejorando la percepción de velocidad de la aplicación para el usuario (que ve el cambio reflejado instantáneamente, sin esperar el viaje de ida y vuelta completo de la petición de red); si la petición finalmente falla, la actualización optimista se revierte, devolviendo la interfaz al estado anterior consistente con lo que el servidor realmente tiene.

`onMutate` se ejecuta inmediatamente al iniciar la mutación (antes de que la petición de red siquiera complete): cancela cualquier refetch en curso de esa query (`cancelQueries`, para evitar que una respuesta tardía sobreescriba la actualización optimista recién aplicada), guarda una copia del estado anterior (`getQueryData`, necesaria para poder revertir si la mutación falla), y aplica el cambio optimista directamente sobre la cache (`setQueryData`); `onError` usa esa copia guardada para revertir la cache exactamente al estado anterior si la mutación efectivamente falla, evitando que la interfaz quede mostrando un cambio que en realidad nunca se aplicó en el servidor.

Este patrón introduce un riesgo inherente: durante la ventana de tiempo entre la actualización optimista y la confirmación real del servidor, la interfaz muestra un estado que todavía no es definitivamente cierto, pudiendo requerir revertirse visualmente si la operación finalmente falla, una experiencia que, aunque generalmente rara si las mutaciones fallan poco frecuentemente, debe comunicarse con cuidado (por ejemplo, con una notificación clara al revertir) para no confundir al usuario sobre qué efectivamente ocurrió.

**Analogía:** un optimistic update es como marcar una tarea como completada en una lista física inmediatamente al terminarla, confiando en que se registrará correctamente en el sistema central más tarde; si luego se descubre que el registro central falló, hay que tachar de nuevo esa marca prematura y notificar que en realidad no se completó.

**¿Por qué es importante?** Los optimistic updates mejoran la percepción de velocidad al reflejar cambios instantáneamente, a costa del riesgo de tener que revertir visualmente la interfaz si la operación finalmente falla en el servidor.

**Diagrama:**

```jsx
useMutation({
  mutationFn: actualizarTarea,
  onMutate: async (nuevaTarea) => {
    await queryClient.cancelQueries({ queryKey: ['tareas'] });
    const anterior = queryClient.getQueryData(['tareas']);
    queryClient.setQueryData(['tareas'], (old) => actualizarEnLista(old, nuevaTarea)); // UI optimista
    return { anterior };
  },
  onError: (err, vars, contexto) => queryClient.setQueryData(['tareas'], contexto.anterior), // revierte si falla
});
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

**Objetivo del laboratorio:** reemplazar fetching manual por TanStack Query, con mutaciones e optimistic updates.

**Requisitos previos:** Módulos 0-5 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Reemplazar `useEffect`+`useState` por `useQuery` | Ver Tema 1 | Verifica la cache con React Query Devtools |
| 2 | Implementar una mutación de creación | Ver Tema 2 | Invalida la query de la lista al completarse |
| 3 | Implementar un optimistic update | Ver Tema 3 | Con reversión ante error simulado |
| 4 | Observar el estado "obsoleto" (stale) | React Query Devtools | Explica cuándo una query se considera obsoleta |

**Verificación:** el laboratorio se considera exitoso si la lista se actualiza automáticamente tras crear un elemento (sin refrescar la página manualmente), y si el optimistic update revierte correctamente la interfaz ante un error simulado en la mutación.

**Errores comunes y soluciones**

- **Olvidar invalidar la query relacionada tras una mutación.** Sin invalidación, la lista mostrada puede quedar desactualizada respecto al servidor.
- **No cancelar queries en curso en `onMutate`.** Una respuesta tardía de un refetch anterior podría sobreescribir la actualización optimista.
- **No implementar `onError` para revertir.** Sin reversión, la interfaz puede mostrar un cambio que en realidad nunca se aplicó en el servidor.

---

## Ejercicios de evaluación

### Ejercicio 1: Loading hell resuelto por TanStack Query

**Enunciado:** enumera al menos tres problemas de manejar fetching manualmente con `useState`/`useEffect` que TanStack Query resuelve automáticamente.

**Solución esperada:** cualquier combinación razonable de: deduplicación de peticiones idénticas simultáneas, cache compartida entre componentes que usan la misma `queryKey`, revalidación automática al recuperar el foco de la ventana, gestión automática de los estados de carga/error/datos sin código manual repetido en cada componente.

**Criterios de éxito:**
- Menciona al menos tres problemas concretos resueltos automáticamente.

### Ejercicio 2: Riesgo de los optimistic updates

**Enunciado:** ¿qué riesgo tiene un optimistic update, y cómo se mitiga?

**Solución esperada:** el riesgo es mostrar temporalmente un cambio en la interfaz que finalmente no se aplicó realmente en el servidor si la mutación falla; se mitiga guardando el estado anterior en `onMutate` y revirtiendo explícitamente a ese estado guardado en `onError`, además de cancelar queries en curso para evitar que una respuesta tardía sobreescriba la actualización optimista.

**Criterios de éxito:**
- Explica correctamente el riesgo de mostrar un cambio no confirmado y el mecanismo de reversión.

### Ejercicio 3: Por qué invalidar en vez de actualizar directamente la cache

**Enunciado:** ¿por qué invalidar la query tras una mutación exitosa es preferible a actualizar manualmente la cache con el resultado exacto de la mutación?

**Solución esperada:** invalidar y dejar que TanStack Query vuelva a solicitar los datos reales garantiza que la vista refleje el estado verdadero y completo del servidor tras el cambio (incluyendo cualquier efecto secundario en el servidor que la mutación pudo haber disparado), mientras que actualizar manualmente la cache con el resultado devuelto por la mutación puede desincronizarse sutilmente si el servidor aplicó cambios adicionales no reflejados directamente en esa respuesta.

**Criterios de éxito:**
- Explica correctamente el riesgo de desincronización de actualizar manualmente frente a la garantía de invalidar y refrescar.

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

- `useQuery` reemplaza el patrón manual de `useState`/`useEffect` para fetching, agregando cache, deduplicación y revalidación automática.
- Las mutaciones invalidan queries relacionadas para mantener la vista sincronizada con el estado real del servidor.
- Los optimistic updates mejoran la percepción de velocidad, con un mecanismo explícito de reversión ante error.

**Conceptos aprendidos**

- TanStack Query: `useQuery` y `useMutation`.
- Invalidación y refetch de queries.
- Optimistic updates y su reversión.

**Próximos pasos**

En el Módulo 7 aprenderás gestión de estado global: Zustand, Redux Toolkit, y la separación entre estado de servidor y estado de cliente.

**Recursos adicionales**

- Documentación oficial de TanStack Query (tanstack.com/query).
