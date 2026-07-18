# Módulo 1: Estado local y el ciclo de render

## Sílabo

**Objetivo general**

Entender exactamente cuándo y por qué React vuelve a renderizar un componente, dominando `useState`, las actualizaciones funcionales, la diferencia entre render y commit, y el batching de actualizaciones.

**Objetivos específicos**

1. Explicar por qué `setCount(count + 1)` repetido no acumula correctamente el valor.
2. Usar actualizaciones funcionales de estado (`setCount(c => c + 1)`) de forma correcta.
3. Diferenciar la fase de render de la fase de commit.
4. Explicar el batching de múltiples actualizaciones de estado.
5. Construir componentes controlados con `value` + `onChange`.

**Contenido**

- `useState` y actualizaciones funcionales.
- Render vs commit.
- Batching de actualizaciones.
- Listas controladas vs no controladas.

**Evaluación**

Formulario controlado con validación en tiempo real basada en `useState`, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: useState y actualizaciones funcionales

**Conceptos clave:** valor capturado por closure, forma funcional del setter.

#### Por qué los Hooks dependen del orden de llamada

`useState` no es una palabra reservada de JavaScript ni una anotación: es una función de React que consulta el **dispatcher** activo durante el render. React asocia cada llamada con una posición estable dentro de la secuencia de Hooks del componente; en renderizados posteriores, esa misma posición permite recuperar la celda de estado correcta. Esta es la razón mecánica de las Reglas de Hooks, no una preferencia de estilo.

No llames Hooks dentro de `if`, ciclos, callbacks o después de un retorno condicional. Si una condición cambia el orden, la segunda llamada de un render puede ocupar la posición que pertenecía a otro estado en el render anterior. Los Hooks deben estar en el nivel superior de un componente o de un Hook personalizado; el prefijo `use` permite además que el linter reconozca y verifique ese contrato.

```jsx
// Incorrecto: la posición de la llamada cambia según `habilitado`
if (habilitado) {
  const [filtro, setFiltro] = useState('');
}

// Correcto: el Hook conserva su posición; la condición afecta al uso del valor
const [filtro, setFiltro] = useState('');
const filtroActivo = habilitado ? filtro : '';
```

Cada vez que un componente se renderiza, la función del componente se ejecuta de nuevo desde el principio, y cada variable declarada dentro de ella (incluyendo el valor devuelto por `useState`) es una nueva variable local de esa ejecución específica, capturada en el closure de los manejadores de eventos definidos en esa misma ejecución (el concepto de closure, estudiado en profundidad en el Módulo 4 del track de JavaScript, aplicado aquí directamente al modelo de componentes de React): esto explica por qué llamar `setCount(count + 1)` dos veces seguidas dentro del mismo manejador de evento no duplica el incremento, dado que ambas llamadas leen el mismo valor de `count` capturado en esa ejecución específica del componente, sin que la primera llamada a `setCount` actualice sincrónicamente el valor de `count` que la segunda llamada leería.

La forma funcional del setter (`setCount(c => c + 1)`) resuelve este problema: en vez de calcular el nuevo valor a partir de la variable capturada en el closure, se le pasa una función que React invoca con el valor de estado más actualizado disponible en el momento en que efectivamente aplica esa actualización, garantizando que actualizaciones sucesivas dentro de un mismo manejador de evento efectivamente se acumulen correctamente unas sobre otras, en vez de sobreescribirse mutuamente basándose en el mismo valor obsoleto capturado.

Esta distinción importa especialmente en cualquier escenario donde múltiples actualizaciones del mismo estado ocurren antes de que el componente vuelva a renderizarse (por ejemplo, dentro de un mismo manejador de evento, o dentro de una función asíncrona que actualiza el mismo estado en distintos momentos), siendo la forma funcional la opción segura por defecto cuando el nuevo valor depende del valor anterior, en vez de asumir que la variable local capturada refleja siempre el estado más reciente.

**Analogía:** usar el valor capturado directamente es como escribir tres notas separadas basadas en la misma fotografía de un marcador que tomaste al principio del día, sin darte cuenta de que el marcador ya cambió después de la primera nota; usar la forma funcional es como pedirle a alguien que consulte el marcador actual real justo antes de escribir cada nota, garantizando que cada una parte del valor efectivamente más reciente.

**¿Por qué es importante?** La forma funcional del setter evita el bug clásico de actualizaciones de estado que se sobreescriben mutuamente al depender de un valor capturado obsoleto en el closure de la ejecución de render en curso.

**Código del ejemplo:**

```jsx
const [count, setCount] = useState(0);

// PELIGROSO: ambas llamadas leen el mismo `count` capturado
setCount(count + 1);
setCount(count + 1); // count sigue siendo el valor original aquí

// SEGURO: la forma funcional siempre recibe el valor más reciente
setCount(c => c + 1);
setCount(c => c + 1); // ahora sí suma 2
```

### Tema 2: Render frente a commit

**Conceptos clave:** fase de render (cálculo), fase de commit (aplicación al DOM real).

React separa internamente el trabajo de actualizar la interfaz en dos fases distintas: la fase de render, durante la cual React ejecuta la función del componente (y de todos sus componentes hijos afectados) para calcular una descripción de qué debería verse en pantalla (una nueva versión del árbol de elementos producido por JSX/`createElement`, Módulo 0), sin todavía tocar el DOM real del navegador; y la fase de commit, durante la cual React compara esa nueva descripción con la anterior (un proceso llamado reconciliation) y aplica al DOM real únicamente los cambios mínimos necesarios para reflejar las diferencias encontradas.

Esta separación explica por qué ejecutar la función de un componente (la fase de render) no necesariamente implica que algo cambie visualmente en pantalla: si el árbol de elementos resultante de esa ejecución es idéntico al anterior, React no necesita aplicar ningún cambio real al DOM durante la fase de commit, aunque la función del componente sí se haya ejecutado completamente de nuevo. Comprender esta separación es fundamental para entender por qué código con efectos secundarios directos dentro del cuerpo de la función componente (fuera de un `useEffect`, Módulo 2) es problemático: ese código se ejecutaría en cada fase de render, potencialmente múltiples veces antes de que cualquier commit real ocurra, en vez de ejecutarse una única vez cuando el cambio efectivamente se aplica.

**Analogía:** la fase de render es como un arquitecto dibujando planos actualizados de un edificio basándose en los requisitos más recientes, sin todavía haber movido un solo ladrillo real; la fase de commit es como el equipo de construcción aplicando físicamente solo los cambios necesarios entre los planos anteriores y los nuevos, sin reconstruir el edificio completo desde cero cada vez.

**¿Por qué es importante?** Entender que renderizar (ejecutar la función del componente) no equivale automáticamente a un cambio visual real explica por qué los efectos secundarios deben vivir dentro de `useEffect` y no directamente en el cuerpo de la función componente.

**Diagrama:**

```
Render:  ejecuta la función componente → calcula el nuevo árbol de elementos
Commit:  compara con el árbol anterior → aplica solo los cambios mínimos al DOM real
(Render puede ocurrir sin que el commit produzca ningún cambio visual)
```

### Tema 3: Batching de actualizaciones

**Conceptos clave:** agrupación de múltiples `setState`, un único re-render.

Cuando múltiples llamadas a funciones de actualización de estado ocurren dentro del mismo manejador de evento (`setA(1); setB(2); setC(3);` dentro de una misma función `manejarClick`), React no vuelve a renderizar el componente inmediatamente después de cada llamada individual, sino que agrupa (batchea) todas esas actualizaciones y ejecuta un único ciclo de render y commit que refleja el efecto combinado de las tres, en vez de tres ciclos separados de render y commit, uno por cada llamada individual a una función de actualización de estado.

Este comportamiento es una optimización de rendimiento deliberada: sin batching, cada llamada individual a `setState` dispararía su propio ciclo completo de render y commit, un desperdicio considerable de trabajo cuando en la práctica el componente solo necesita reflejar el estado final combinado de las tres actualizaciones, no cada estado intermedio parcial entre ellas. Este comportamiento se puede verificar empíricamente colocando un `console.log` dentro del cuerpo del componente (que se ejecuta una vez por cada render): tras las tres llamadas a `setState`, ese `console.log` se ejecuta una única vez adicional, no tres veces, confirmando que las tres actualizaciones efectivamente se agruparon en un único render.

**Analogía:** el batching es como un cajero que espera a que termines de pedir los tres artículos completos antes de calcular el total una única vez, en vez de recalcular y anunciar un nuevo total parcial después de cada artículo individual que mencionas.

**¿Por qué es importante?** El batching evita ciclos de render y commit redundantes cuando múltiples actualizaciones de estado ocurren en el mismo manejador de evento, aplicando únicamente el estado final combinado en un único ciclo.

**Código del ejemplo:**

```jsx
function manejarClick() {
  setA(1);
  setB(2);
  setC(3);
  // React agrupa (batchea) estas tres actualizaciones en un único re-render, no en tres
}
```

### Tema 4: Componentes controlados

**Conceptos clave:** `value` + `onChange`, React como única fuente de verdad.

Un componente controlado es un elemento de formulario (`<input>`, `<select>`, `<textarea>`) cuyo valor está gobernado completamente por el estado de React, no por el estado interno propio que el elemento del DOM mantendría por defecto: `<input value={valor} onChange={e => setValor(e.target.value)} />` establece que el valor mostrado en el input siempre proviene directamente del estado de React (`valor`), y que cualquier cambio tecleado por el usuario dispara `onChange`, que a su vez actualiza ese mismo estado, que a su vez vuelve a renderizar el input con el nuevo valor — un ciclo completo donde React es la única fuente de verdad, y el DOM nunca "decide" su propio valor de forma independiente sin que React lo sepa.

Esto contrasta con un componente no controlado, donde el DOM mantiene su propio valor interno de forma autónoma, y React solo lo consulta puntualmente cuando es necesario (típicamente mediante una referencia con `useRef`, Módulo 2), en vez de sincronizar ese valor en cada tecla. Los componentes controlados son el enfoque recomendado por defecto porque permiten validar, transformar, o reaccionar al valor tecleado en cada cambio de forma centralizada en el estado de React (útil para validación en tiempo real, formateo automático, o sincronización con otros campos), a costa de un re-render en cada tecla, un costo generalmente insignificante salvo en formularios extremadamente grandes, donde React Hook Form (Módulo 3) ofrece una alternativa que evita ese costo mediante un enfoque no controlado optimizado.

**Analogía:** un componente controlado es como un teleprompter donde el texto mostrado siempre proviene de un guion central que se actualiza en cada cambio; un componente no controlado es como una pizarra donde alguien escribe libremente y solo se consulta lo que dice cuando alguien decide leerla, sin que exista un guion central sincronizado en todo momento.

**¿Por qué es importante?** Los componentes controlados hacen del estado de React la única fuente de verdad del valor de un input, permitiendo validación y transformación centralizada en cada cambio, a costa de un re-render adicional por cada tecla.

**Código del ejemplo:**

```jsx
const [valor, setValor] = useState('');
<input value={valor} onChange={e => setValor(e.target.value)} />
// El DOM nunca "decide" su propio valor de forma independiente
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

**Objetivo del laboratorio:** construir un formulario controlado con validación en tiempo real, demostrando actualizaciones funcionales y batching.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un contador y demostrar el bug de `count + 1` repetido | Ver Tema 1 | Compara con la forma funcional |
| 2 | Construir un input controlado | Ver Tema 4 | `value` + `onChange` |
| 3 | Agregar 3 `setState` en un mismo manejador | Ver Tema 3 | Verifica con `console.log` que hay un único render |
| 4 | Implementar un formulario de 3 campos controlados | Ver Tema 4 | Con validación en cada tecla |
| 5 | Explicar render vs commit con un ejemplo propio | Ver Tema 2 | Un caso donde el render no cambia el DOM |

**Verificación:** el laboratorio se considera exitoso si el contador con la forma funcional acumula correctamente múltiples incrementos en un mismo manejador, y si el formulario valida y refleja el estado en tiempo real en cada tecla.

**Errores comunes y soluciones**

- **Depender del valor capturado en vez de la forma funcional cuando el nuevo estado depende del anterior.** Usa siempre `setEstado(valorAnterior => nuevoValor)` en esos casos.
- **Confundir la ejecución del render con un cambio visual garantizado.** Recuerda que React puede ejecutar la función del componente sin producir ningún cambio real en el DOM.
- **Mezclar un input controlado con actualización directa del DOM.** No mezcles `value` controlado con manipulación directa del elemento vía referencia.

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

- La forma funcional del setter de estado evita el bug de actualizaciones basadas en un valor capturado obsoleto.
- Render (calcular) y commit (aplicar al DOM) son fases distintas del ciclo de actualización de React.
- React agrupa (batchea) múltiples actualizaciones de estado en el mismo manejador de evento en un único render.
- Un componente controlado hace del estado de React la única fuente de verdad del valor de un input.

**Conceptos aprendidos**

- `useState` y actualizaciones funcionales.
- Diferencia entre render y commit.
- Batching de actualizaciones de estado.
- Componentes controlados frente a no controlados.

**Próximos pasos**

En el Módulo 2 aprenderás los hooks esenciales: `useEffect`, `useRef`, `useMemo`/`useCallback`, las reglas de los hooks, `useReducer` y `useImperativeHandle`.

**Recursos adicionales**

- Documentación oficial de React (react.dev): "State: A Component's Memory" y "Render and Commit".
