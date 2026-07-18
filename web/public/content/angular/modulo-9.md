# Módulo 9: Gestión de estado

## Sílabo

**Objetivo general**

Construir stores de estado compartido usando signals, y entender cuándo la complejidad adicional de NgRx está genuinamente justificada frente a una solución más simple.

**Objetivos específicos**

1. Construir un store propio combinando `signal` y `computed`.
2. Explicar cómo un store inyectable comparte estado entre componentes sin pasar props manualmente.
3. Escribir actions, reducers y selectors de NgRx.
4. Evaluar cuándo la ceremonia de NgRx está justificada frente a un store de signals.
5. Explicar el rol de los effects de NgRx para side-effects asíncronos.

**Contenido**

- Store propio con signals (`CarritoStore`).
- Actions, reducers y selectors de NgRx.
- Cuándo NgRx justifica su complejidad.

**Evaluación**

Construcción de un store de carrito de compras con signals, y comparación con una implementación equivalente en NgRx, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Construcción de un store de carrito de compras con signals, y comparación con una implementación equivalente en NgRx, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
npx ng version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
npx @angular/cli@latest new academia-labs/angular-app --standalone --routing --style=scss
cd academia-labs/angular-app
git init
```

Trabaja dentro de `academia-labs/angular-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/angular-app/
├─ src/app/features/
│  └─ module-9/
├─ tests/
├─ docs/decisions/
├─ evidence/module-9/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Store propio con signals | `src/app/features/module-9/topic-1-store-propio-con-signals.ts` | prueba + salida observable |
| 2. NgRx — actions, reducers y selectors | `src/app/features/module-9/topic-2-ngrx-actions-reducers-y-selectors.ts` | prueba + salida observable |
| 3. Cuándo NgRx justifica su complejidad | `src/app/features/module-9/topic-3-cuando-ngrx-justifica-su-complejidad.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/angular-app`:

```bash
npm test -- --watch=false && npm start
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Construcción de un store de carrito de compras con signals, y comparación con una implementación equivalente en NgRx, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula un estado vacío o un error HTTP y comprueba que la interfaz muestre recuperación y no una pantalla ambigua. Guarda en `evidence/module-9/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Gestión de estado** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Store propio con signals

**Conceptos clave:** `@Injectable({ providedIn: 'root' })`, encapsulación de estado mutable, exposición de solo lectura.

Un store de signals es, en esencia, un servicio inyectable (Módulo 3) que encapsula uno o varios signals de estado privados, exponiendo hacia el exterior únicamente versiones de solo lectura de ese estado (mediante `asReadonly()`, estudiado en el Módulo 2) junto con métodos públicos explícitos que son la única forma permitida de modificar ese estado internamente, un patrón que aplica el mismo principio de encapsulación estudiado para clases en general (Módulo 4 del track de JavaScript) al caso específico del estado reactivo compartido de una aplicación.

En el ejemplo de `CarritoStore`, el signal privado `items` mantiene el arreglo de productos en el carrito, expuesto hacia afuera como `lista` mediante `asReadonly()` (impidiendo que código externo llame `.set()` o `.update()` directamente sobre él, forzándolo a pasar por los métodos `agregar()`/`quitar()` explícitamente definidos por el store); `total`, un `computed()` derivado de `items`, se recalcula automáticamente cada vez que el arreglo de items cambia, sin que ningún código tenga que recordar mantenerlo sincronizado manualmente.

Al estar registrado con `providedIn: 'root'` (Módulo 3), cualquier componente en cualquier parte del árbol de la aplicación que inyecte `CarritoStore` recibe la misma instancia única compartida, viendo automáticamente el mismo estado actualizado sin necesidad de pasar ese estado manualmente como input a través de una cadena potencialmente larga de componentes intermedios que no necesitan conocer ese estado en absoluto (el problema de "prop drilling" que este patrón evita estructuralmente).

**Analogía:** un store de signals es como una caja fuerte con un único guardián autorizado (el propio servicio) que controla exactamente qué operaciones están permitidas sobre su contenido (los métodos públicos), mientras que cualquiera puede consultar el contenido actual a través de una ventana de solo observación (la versión de solo lectura expuesta), sin poder alterarlo directamente por su cuenta.

**¿Por qué es importante?** Un store de signals encapsulado evita que cualquier parte de la aplicación modifique el estado compartido de forma descontrolada, y evita el "prop drilling" de pasar estado manualmente a través de componentes intermedios que no lo necesitan.

**Código del ejemplo:**

```ts
@Injectable({ providedIn: 'root' })
export class CarritoStore {
  private items = signal<Item[]>([]);
  readonly lista = this.items.asReadonly();
  readonly total = computed(() => this.items().reduce((s, i) => s + i.precio, 0));

  agregar(item: Item) { this.items.update(l => [...l, item]); }
  quitar(id: string) { this.items.update(l => l.filter(i => i.id !== id)); }
}
```

### Tema 2: NgRx — actions, reducers y selectors

**Conceptos clave:** flujo unidireccional de datos, funciones puras, historial inspeccionable.

NgRx implementa el patrón Redux para Angular: en vez de modificar el estado directamente mediante métodos de un servicio (como en el Tema 1), el estado se modifica exclusivamente despachando "actions" (objetos planos que describen qué ocurrió, como `agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>())`), que son procesadas por "reducers" — funciones puras (Módulo 3 del track de JavaScript) que reciben el estado actual y una action, y devuelven un nuevo estado sin mutar el original (`carritoReducer`, usando `on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))`).

Los "selectors" (`createSelector`) son funciones derivadas que calculan valores a partir del estado global del store de NgRx, de forma conceptualmente equivalente a un `computed()` de signals (Módulo 2) pero operando sobre el árbol de estado inmutable de NgRx en vez de sobre un signal individual, memoizando automáticamente su resultado para evitar recálculos innecesarios cuando las partes del estado de las que depende no han cambiado.

Este flujo estrictamente unidireccional (acción despachada → reducer puro → nuevo estado → selectors recalculados → vista actualizada) hace que cada cambio de estado en la aplicación quede registrado como una action explícita con nombre descriptivo, habilitando herramientas como Redux DevTools para inspeccionar el historial completo de cambios de estado a lo largo del tiempo, incluyendo la capacidad de viajar en el tiempo (time-travel debugging) para reproducir exactamente la secuencia de acciones que llevó a un estado particular, algo que un store de signals simple no ofrece de forma nativa.

**Analogía:** un reducer de NgRx es como un contable que nunca modifica un libro de cuentas existente directamente, sino que siempre registra una nueva entrada firmada (la action) y produce un balance completamente nuevo a partir de esa entrada, dejando un rastro auditable completo de cada cambio ocurrido a lo largo del tiempo.

**¿Por qué es importante?** El flujo unidireccional estricto de NgRx, con reducers puros y actions explícitas, produce un historial de cambios completamente inspeccionable y reproducible, a costa de más ceremonia de código que un store de signals directo.

**Código del ejemplo:**

```ts
const agregarItem = createAction('[Carrito] Agregar', props<{ item: Item }>());

const carritoReducer = createReducer(estadoInicial,
  on(agregarItem, (estado, { item }) => ({ ...estado, items: [...estado.items, item] }))
);

const selectTotal = createSelector(selectCarrito, (estado) =>
  estado.items.reduce((s, i) => s + i.precio, 0)
);
```

### Tema 3: Cuándo NgRx justifica su complejidad

**Conceptos clave:** ceremonia frente a beneficio, escala del equipo, complejidad de side-effects asíncronos.

NgRx agrega una cantidad considerable de ceremonia respecto a un store de signals directo: cada cambio de estado requiere definir una action, un caso en un reducer, y potencialmente un selector para leerlo de vuelta, además de (para lógica asíncrona) un "effect" que escucha ciertas actions y despacha nuevas actions como resultado de operaciones asíncronas (como una petición HTTP), una capa adicional de indirección que no existe en un store de signals, donde la lógica asíncrona simplemente vive directamente dentro de un método del store.

Esta ceremonia adicional está genuinamente justificada cuando el historial de cambios inspeccionable es un requisito real (depuración de bugs de estado complejos en producción, reproducir exactamente una secuencia de eventos reportada por un usuario), cuando un equipo grande necesita un patrón único y predecible para modificar estado en toda la base de código (evitando que cada desarrollador invente su propia convención ad-hoc para gestionar estado), o cuando la lógica de side-effects asíncronos es genuinamente compleja (múltiples acciones encadenadas condicionalmente, cancelación de flujos en curso, coordinación entre múltiples fuentes de eventos).

Para la mayoría de features de tamaño moderado, sin embargo, un store de signals bien diseñado (Tema 1) ofrece prácticamente el mismo beneficio de estado compartido y encapsulado con una fracción de la ceremonia, siendo la recomendación por defecto salvo que exista una razón concreta y específica (no solo "podría ser útil algún día") para asumir el costo adicional de NgRx.

**Analogía:** NgRx es como un sistema de contabilidad corporativo completo con auditoría externa, apropiado para una empresa grande con múltiples departamentos y necesidad de trazabilidad legal; un store de signals es como llevar las cuentas personales en una libreta simple, perfectamente adecuado y mucho menos costoso de mantener cuando la escala y las necesidades de auditoría no lo justifican.

**¿Por qué es importante?** Elegir NgRx por defecto sin una necesidad concreta impone ceremonia innecesaria; elegir un store de signals cuando el historial inspeccionable o la coordinación de equipo grande son genuinamente necesarios deja a la aplicación sin herramientas que resultarán valiosas más adelante.

**Diagrama:**

```
Store de signals: menos ceremonia, ideal para la mayoría de features
NgRx: más ceremonia, justificado cuando se necesita historial inspeccionable,
      patrón único en equipos grandes, o side-effects asíncronos complejos
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

**Objetivo del laboratorio:** construir un store de carrito de compras con signals, y una versión equivalente simplificada en NgRx para comparar.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `CarritoStore` con signals | Ver Tema 1 | Encapsula el estado, expone solo lectura |
| 2 | Inyectarlo en dos componentes distintos | `inject(CarritoStore)` | Verifica que ambos ven el mismo estado |
| 3 | Definir la action, reducer y selector equivalentes | Ver Tema 2 | Compara la ceremonia frente al store de signals |
| 4 | Comparar ambas implementaciones | — | Discute cuándo cada una sería apropiada |

**Verificación:** el laboratorio se considera exitoso si ambos componentes reflejan el mismo estado del carrito en tiempo real al modificarlo desde cualquiera de los dos, y si puedes articular claramente en qué escenario elegirías NgRx en vez del store de signals.

**Errores comunes y soluciones**

- **Exponer el signal mutable directamente sin `asReadonly()`.** Cualquier componente externo podría modificar el estado sin pasar por los métodos del store, rompiendo la encapsulación.
- **Mutar el arreglo dentro de `update()` en vez de crear uno nuevo.** Usa siempre spread (`[...l, item]`) para mantener inmutabilidad (Módulo 2).
- **Adoptar NgRx sin una razón concreta.** Evalúa primero si un store de signals cubre la necesidad real.

---

## Ejercicios de evaluación

### Ejercicio 1: Encapsulación en un store de signals

**Enunciado:** explica por qué `CarritoStore` expone `lista` como `this.items.asReadonly()` en vez de exponer `items` directamente.

**Solución esperada:** exponer el signal mutable directamente permitiría que cualquier código externo lo modifique con `.set()` o `.update()` sin pasar por los métodos `agregar()`/`quitar()` del store, rompiendo la encapsulación y permitiendo cambios de estado no controlados ni rastreables; `asReadonly()` expone una versión de solo lectura que solo puede leerse, no modificarse, forzando toda modificación a pasar por los métodos públicos explícitos.

**Criterios de éxito:**
- Explica correctamente el riesgo de exponer el signal mutable y el rol de `asReadonly()`.

### Ejercicio 2: Reducers puros

**Enunciado:** ¿por qué los reducers de NgRx deben ser funciones puras que no mutan el estado original?

**Solución esperada:** un reducer puro que siempre devuelve un nuevo objeto de estado (sin mutar el original) garantiza que la detección de cambios y las herramientas de depuración (como time-travel debugging) puedan confiar en que cada referencia de estado distinta representa un momento distinto e inmutable en el historial; mutar el estado original rompería esa garantía, haciendo indistinguibles estados que en realidad son diferentes momentos en el tiempo.

**Criterios de éxito:**
- Explica correctamente la relación entre pureza/inmutabilidad y la confiabilidad del historial de estado.

### Ejercicio 3: Justificar NgRx

**Enunciado:** da un ejemplo concreto de un escenario donde la ceremonia adicional de NgRx estaría genuinamente justificada frente a un store de signals.

**Solución esperada:** cualquier respuesta razonable que mencione historial de cambios inspeccionable para depurar bugs complejos en producción, necesidad de un patrón único y predecible en un equipo grande con muchos desarrolladores, o coordinación de side-effects asíncronos complejos (múltiples acciones encadenadas condicionalmente, cancelación coordinada de flujos).

**Criterios de éxito:**
- Da un ejemplo concreto y razonablemente justificado, no solo "podría ser útil".

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

- Google, *Angular Documentation* y guías oficiales de accesibilidad, seguridad y rendimiento.
- ReactiveX, *RxJS Documentation*.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Un store de signals encapsula estado con `providedIn: 'root'`, exponiendo solo lectura y métodos explícitos de modificación.
- NgRx impone flujo unidireccional estricto con actions, reducers puros y selectors memoizados.
- NgRx justifica su ceremonia adicional con historial inspeccionable, patrones únicos en equipos grandes, y side-effects asíncronos complejos.
- Para la mayoría de features, un store de signals bien diseñado es más simple y suficiente.

**Conceptos aprendidos**

- Construcción de stores propios con signals.
- Actions, reducers y selectors de NgRx.
- Criterios para elegir entre un store de signals y NgRx.

**Próximos pasos**

En el Módulo 10 aprenderás testing en Angular: TestBed, Angular Testing Library, y mocking de HttpClient.

**Recursos adicionales**

- Documentación oficial de NgRx (ngrx.io) y de Angular: "Signals" para patrones de store propios.
