# Módulo 11: TypeScript con React

## Sílabo

**Objetivo general**

Tipar props, estado, hooks personalizados y eventos de React para detectar errores en tiempo de compilación en vez de en ejecución, incluyendo componentes polimórficos correctamente tipados.

**Objetivos específicos**

1. Tipar props de un componente con una interface, incluyendo `children`.
2. Escribir un hook personalizado genérico reutilizable para cualquier tipo de dato.
3. Tipar correctamente eventos sintéticos de React.
4. Migrar un componente a TypeScript estricto sin usar `any`.
5. Explicar cómo tipar un componente polimórfico.

**Contenido**

- Tipado de props y `children`.
- Generics en hooks personalizados.
- Tipado de eventos sintéticos.
- Componentes polimórficos tipados.

**Evaluación**

Migración de un componente complejo a TypeScript estricto sin `any`, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Migración de un componente complejo a TypeScript estricto sin `any`, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-11/
├─ tests/
├─ docs/decisions/
├─ evidence/module-11/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Tipado de props y children | `src/features/module-11/topic-1-tipado-de-props-y-children.tsx` | prueba + salida observable |
| 2. Hooks genéricos | `src/features/module-11/topic-2-hooks-genericos.tsx` | prueba + salida observable |
| 3. Eventos tipados y componentes polimórficos | `src/features/module-11/topic-3-eventos-tipados-y-componentes-polimorficos.tsx` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/react-app`:

```bash
npm test -- --run && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Migración de un componente complejo a TypeScript estricto sin `any`, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia una prop o respuesta a un caso vacío o erróneo; observa el estado visual y corrige desde la primera causa. Guarda en `evidence/module-11/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **TypeScript con React** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Tipado de props y children

**Conceptos clave:** `interface`, `React.ReactNode`, props opcionales.

Tipar las props de un componente con una interface (`interface TarjetaProps { titulo: string; children: React.ReactNode; onSeleccionar?: () => void; }`) declara explícitamente qué forma deben tener los datos que el componente espera recibir, permitiendo que TypeScript detecte en tiempo de compilación errores como olvidar una prop obligatoria, pasar un tipo incorrecto, o invocar una función opcional sin verificar primero que efectivamente fue proporcionada, exactamente el mismo beneficio general de tipado estático estudiado a lo largo del track de TypeScript, aplicado aquí específicamente a la superficie de props de un componente React.

`React.ReactNode` es el tipo apropiado para `children` (y para cualquier prop que reciba contenido renderizable arbitrario), dado que abarca correctamente todo lo que React puede renderizar válidamente: elementos JSX, strings, números, arreglos de esos elementos, o incluso `null`/`undefined` (que React simplemente no renderiza), un tipo deliberadamente más amplio que `React.ReactElement` (que representa específicamente un elemento JSX único, sin abarcar strings o arreglos sueltos), siendo importante elegir el tipo correcto según qué tan restrictivo debe ser realmente el contenido aceptado por ese componente específico.

**Analogía:** tipar las props de un componente es como especificar exactamente qué ingredientes y en qué formato acepta una receta antes de intentar prepararla, detectando de antemano si falta un ingrediente obligatorio o si el formato de alguno no es el esperado, en vez de descubrirlo a mitad de la preparación real.

**¿Por qué es importante?** Tipar las props detecta en tiempo de compilación errores de uso del componente (props faltantes, tipos incorrectos) que de otro modo solo se manifestarían como errores en tiempo de ejecución, potencialmente en producción.

**Código del ejemplo:**

```tsx
interface TarjetaProps {
  titulo: string;
  children: React.ReactNode;
  onSeleccionar?: () => void; // opcional
}

function Tarjeta({ titulo, children, onSeleccionar }: TarjetaProps) {
  return <div onClick={onSeleccionar}><h2>{titulo}</h2>{children}</div>;
}
```

### Tema 2: Hooks genéricos

**Conceptos clave:** parámetro de tipo `<T>`, reutilización para cualquier tipo de dato.

Un hook personalizado genérico (`function useLocalStorage<T>(clave: string, valorInicial: T) {...}`) usa un parámetro de tipo (`T`) para permanecer reutilizable para cualquier tipo de dato concreto que se le pase, en vez de fijar de antemano un tipo específico (por ejemplo, `string` únicamente) que limitaría su reutilización a ese único caso: al invocarlo como `useLocalStorage<'claro' | 'oscuro'>('tema', 'claro')`, TypeScript infiere (o recibe explícitamente) que `T` es el tipo unión `'claro' | 'oscuro'` para esa invocación específica, tipando correctamente tanto el valor devuelto como el setter correspondiente según ese tipo concreto, sin que el hook en sí tenga que conocer de antemano cuál será ese tipo específico en cada uso particular.

Este mismo principio de generics aplicado a hooks es exactamente el mismo concepto de generics estudiado de forma más general para funciones y clases en el track de TypeScript, aplicado aquí específicamente al caso de hooks personalizados de React: el hook define su comportamiento una única vez de forma abstracta sobre un tipo `T` no especificado todavía, y cada punto de uso concreto especifica (o permite que TypeScript infiera) cuál es ese tipo específico para esa invocación particular, obteniendo tipado preciso sin necesidad de duplicar la implementación del hook para cada tipo de dato distinto que pudiera necesitarse.

**Analogía:** un hook genérico es como un molde ajustable que puede producir piezas de distintas formas específicas según el parámetro que se le indique, en vez de tener que fabricar un molde completamente nuevo y separado para cada forma específica de pieza que se necesite producir.

**¿Por qué es importante?** Un hook genérico se escribe una única vez y se reutiliza correctamente tipado para cualquier tipo de dato concreto, evitando duplicar la implementación para cada tipo específico que pudiera necesitarse.

**Código del ejemplo:**

```tsx
function useLocalStorage<T>(clave: string, valorInicial: T) {
  const [valor, setValor] = useState<T>(() => {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : valorInicial;
  });
  useEffect(() => localStorage.setItem(clave, JSON.stringify(valor)), [clave, valor]);
  return [valor, setValor] as const;
}

const [tema, setTema] = useLocalStorage<'claro' | 'oscuro'>('tema', 'claro');
```

### Tema 3: Eventos tipados y componentes polimórficos

**Conceptos clave:** `React.ChangeEvent<T>`, componentes que renderizan como elemento configurable.

Tipar el parámetro de un manejador de eventos con el tipo específico correspondiente (`function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) { console.log(e.target.value); }`) permite que TypeScript sepa exactamente qué propiedades existen en `e.target` según el tipo de elemento involucrado (`.value` existe en un `HTMLInputElement`, pero no necesariamente de la misma forma en otros tipos de elementos), detectando en tiempo de compilación el acceso a una propiedad que no existiría realmente en ese tipo específico de evento, en vez de descubrir ese error únicamente en tiempo de ejecución con un valor `undefined` inesperado.

Un componente polimórfico es aquel que puede renderizarse como distintos elementos HTML o componentes subyacentes según una prop `as` (`<Boton as="a" href="/inicio">Ir</Boton>` renderizando un `<a>` en vez de un `<button>`), y tiparlo correctamente (`type BotonProps<T extends React.ElementType> = { as?: T } & React.ComponentPropsWithoutRef<T>`) requiere que TypeScript infiera dinámicamente qué props son válidas según el elemento específico indicado en `as` (aceptando `href` cuando `as="a"`, pero rechazándolo cuando `as` es el valor por defecto `'button'`, dado que un `<button>` no tiene una prop `href` válida), un patrón de tipado avanzado que preserva la seguridad de tipos incluso para componentes deliberadamente flexibles en cuanto a qué elemento final renderizan.

**Analogía:** un componente polimórfico correctamente tipado es como un formulario de pedido que ajusta automáticamente qué campos son válidos y obligatorios según qué producto específico se seleccione, en vez de mostrar siempre el mismo conjunto fijo de campos sin importar qué producto realmente se está pidiendo.

**¿Por qué es importante?** Tipar eventos sintéticos correctamente detecta accesos inválidos a propiedades del evento en tiempo de compilación; tipar componentes polimórficos preserva la seguridad de tipos incluso cuando el elemento final renderizado es configurable dinámicamente.

**Código del ejemplo:**

```tsx
function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value); // TypeScript sabe que .value existe
}

type BotonProps<T extends React.ElementType> = { as?: T } & React.ComponentPropsWithoutRef<T>;
function Boton<T extends React.ElementType = 'button'>({ as, ...props }: BotonProps<T>) {
  const Componente = as || 'button';
  return <Componente {...props} />;
}
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

**Objetivo del laboratorio:** migrar un componente existente a TypeScript estricto, incluyendo un hook genérico y un componente polimórfico.

**Requisitos previos:** Módulos 0-10 completados, conocimientos de TypeScript.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Tipar las props de un componente existente | Ver Tema 1 | Incluye `children: React.ReactNode` |
| 2 | Escribir `useLocalStorage<T>` genérico | Ver Tema 2 | Verifica que funciona para distintos tipos |
| 3 | Tipar correctamente un evento de input | Ver Tema 3 | `React.ChangeEvent<HTMLInputElement>` |
| 4 | Migrar el componente completo sin `any` | — | Verifica con `tsc --noEmit` en modo estricto |

**Verificación:** el laboratorio se considera exitoso si el componente migrado compila en modo estricto sin ningún `any`, y si el hook genérico funciona correctamente para al menos dos tipos de datos distintos en distintos puntos de uso.

**Errores comunes y soluciones**

- **Usar `any` para evitar un error de tipado difícil.** Investiga el tipo correcto específico en vez de recurrir a `any`, que anula la verificación de tipos.
- **Tipar `children` como `React.ReactElement` en vez de `React.ReactNode`.** Usa `React.ReactNode` si el componente acepta contenido renderizable arbitrario, no solo un único elemento JSX.
- **Olvidar el parámetro de tipo al invocar un hook genérico.** Especifícalo explícitamente cuando TypeScript no pueda inferirlo del contexto.

---

## Ejercicios de evaluación

### Ejercicio 1: Beneficio de tipar props

**Enunciado:** ¿qué gana tu equipo al tipar las props de un componente en vez de confiar en PropTypes (validación en tiempo de ejecución) o en nada?

**Solución esperada:** tipar las props con TypeScript detecta errores de uso del componente (props faltantes, tipos incorrectos) en tiempo de compilación, antes de que el código llegue a producción; PropTypes valida en tiempo de ejecución, detectando el error solo cuando efectivamente se ejecuta el código con datos incorrectos, potencialmente ya en producción.

**Criterios de éxito:**
- Explica correctamente la diferencia entre detección en tiempo de compilación (TypeScript) y en tiempo de ejecución (PropTypes).

### Ejercicio 2: Por qué un hook genérico es más reutilizable

**Enunciado:** ¿por qué un hook genérico como `useLocalStorage<T>` es más reutilizable que uno con un tipo fijo como `useLocalStorage` tipado únicamente para `string`?

**Solución esperada:** un hook genérico se escribe una única vez de forma abstracta sobre un tipo `T` no especificado todavía, permitiendo reutilizarlo correctamente tipado para cualquier tipo de dato concreto en cada punto de uso; un hook con un tipo fijo solo funcionaría correctamente tipado para ese único tipo específico, requiriendo duplicar la implementación para cualquier otro tipo de dato necesario.

**Criterios de éxito:**
- Explica correctamente la reutilización sin duplicación que ofrece el parámetro de tipo genérico.

### Ejercicio 3: Componentes polimórficos

**Enunciado:** explica qué problema de tipado resuelve un componente polimórfico correctamente tipado que uno sin ese tipado no resolvería.

**Solución esperada:** un componente polimórfico correctamente tipado ajusta dinámicamente qué props son válidas según el elemento indicado en `as` (por ejemplo, aceptando `href` solo cuando `as="a"`); sin ese tipado dinámico, o bien se aceptarían props inválidas para el elemento actual sin ninguna advertencia de TypeScript, o bien habría que fijar de antemano un único elemento posible, perdiendo la flexibilidad del componente.

**Criterios de éxito:**
- Explica correctamente la validación dinámica de props según el elemento indicado en `as`.

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

- Tipar props con una interface detecta errores de uso del componente en tiempo de compilación.
- `React.ReactNode` es el tipo apropiado para `children` y contenido renderizable arbitrario.
- Un hook genérico se reutiliza correctamente tipado para cualquier tipo de dato sin duplicar su implementación.
- Los componentes polimórficos correctamente tipados ajustan dinámicamente qué props son válidas según el elemento renderizado.

**Conceptos aprendidos**

- Tipado de props y `children`.
- Hooks genéricos con parámetros de tipo.
- Eventos sintéticos tipados.
- Componentes polimórficos tipados.

**Próximos pasos**

En el Módulo 12, el proyecto integrador final, unirás routing, estado global y data fetching en una aplicación real con TypeScript.

**Recursos adicionales**

- Documentación oficial de TypeScript (typescriptlang.org) y de React (react.dev): "TypeScript" en la sección de referencia.
