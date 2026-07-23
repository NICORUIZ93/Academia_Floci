# Módulo 11: TypeScript con React


## Aprende construyendo

### Tema 1: Tipado de props y children

#### Paso 1 · Objetivo y preparación
Al finalizar podrás tipar componentes React desde cero. Prerrequisitos: Node.js LTS, npm, TypeScript y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, tarjetas, formularios y eventos de una app de entregas deben rechazar datos incompatibles antes de llegar al usuario.

#### Paso 3 · Teoría, modelo mental y analogía
Props describen entradas, children composición y genéricos reutilización sin perder tipos. Eventos requieren tipos del elemento real; componentes polimórficos separan as de la semántica. La analogía es un formulario de aduana: cada campo tiene tipo y destino explícitos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m11
cd ejemplo-react-m11
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryCard.tsx con props tipadas, children y un handler ChangeEvent; muestra error de TypeScript y corrección.

#### Paso 5 · Práctica guiada
Pista: pasa deliberadamente una prop incompatible para provocar un fallo deliberado de compilación; lee el diagnóstico y corrígelo. Resultado esperado: tsc y la vista sin errores.

#### Paso 6 · Práctica independiente
Crea un hook genérico, un Button polimórfico con ref y pruebas de eventos de teclado; evita any.

#### Paso 7 · Cierre y evidencia
Guarda código, diagnóstico y captura; como siguiente paso estudia accesibilidad. Errores comunes: any en props, children opcional sin razón, handlers sin tipo y genéricos que ocultan errores. Fuentes oficiales: https://react.dev/learn/typescript y https://www.typescriptlang.org/docs/.
**¿Por qué es importante?** Porque los tipos convierten contratos de UI en feedback temprano y documentación ejecutable.
**Evidencia de aprendizaje:** entrega props, hook, evento, error y corrección; explica el resultado y conserva la salida.
**Conceptos clave:** `interface`, `React.ReactNode`, props opcionales.

```typescript
interface TarjetaProps {
  titulo: string;
  children: React.ReactNode;
  onSeleccionar?: () => void;
}
```

Tipar las props de un componente con una interface declara explícitamente qué forma deben tener los datos que el componente espera recibir, permitiendo que TypeScript detecte en tiempo de compilación errores como olvidar una prop obligatoria, pasar un tipo incorrecto, o invocar una función opcional sin verificar primero que efectivamente fue proporcionada, exactamente el mismo beneficio general de tipado estático estudiado a lo largo del track de TypeScript, aplicado aquí específicamente a la superficie de props de un componente React.

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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás tipar componentes React desde cero. Prerrequisitos: Node.js LTS, npm, TypeScript y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, tarjetas, formularios y eventos de una app de entregas deben rechazar datos incompatibles antes de llegar al usuario.

#### Paso 3 · Teoría, modelo mental y analogía
Props describen entradas, children composición y genéricos reutilización sin perder tipos. Eventos requieren tipos del elemento real; componentes polimórficos separan as de la semántica. La analogía es un formulario de aduana: cada campo tiene tipo y destino explícitos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m11
cd ejemplo-react-m11
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryCard.tsx con props tipadas, children y un handler ChangeEvent; muestra error de TypeScript y corrección.

#### Paso 5 · Práctica guiada
Pista: pasa deliberadamente una prop incompatible para provocar un fallo deliberado de compilación; lee el diagnóstico y corrígelo. Resultado esperado: tsc y la vista sin errores.

#### Paso 6 · Práctica independiente
Crea un hook genérico, un Button polimórfico con ref y pruebas de eventos de teclado; evita any.

#### Paso 7 · Cierre y evidencia
Guarda código, diagnóstico y captura; como siguiente paso estudia accesibilidad. Errores comunes: any en props, children opcional sin razón, handlers sin tipo y genéricos que ocultan errores. Fuentes oficiales: https://react.dev/learn/typescript y https://www.typescriptlang.org/docs/.
**¿Por qué es importante?** Porque los tipos convierten contratos de UI en feedback temprano y documentación ejecutable.
**Evidencia de aprendizaje:** entrega props, hook, evento, error y corrección; explica el resultado y conserva la salida.
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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás tipar componentes React desde cero. Prerrequisitos: Node.js LTS, npm, TypeScript y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, tarjetas, formularios y eventos de una app de entregas deben rechazar datos incompatibles antes de llegar al usuario.

#### Paso 3 · Teoría, modelo mental y analogía
Props describen entradas, children composición y genéricos reutilización sin perder tipos. Eventos requieren tipos del elemento real; componentes polimórficos separan as de la semántica. La analogía es un formulario de aduana: cada campo tiene tipo y destino explícitos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m11
cd ejemplo-react-m11
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/components/DeliveryCard.tsx con props tipadas, children y un handler ChangeEvent; muestra error de TypeScript y corrección.

#### Paso 5 · Práctica guiada
Pista: pasa deliberadamente una prop incompatible para provocar un fallo deliberado de compilación; lee el diagnóstico y corrígelo. Resultado esperado: tsc y la vista sin errores.

#### Paso 6 · Práctica independiente
Crea un hook genérico, un Button polimórfico con ref y pruebas de eventos de teclado; evita any.

#### Paso 7 · Cierre y evidencia
Guarda código, diagnóstico y captura; como siguiente paso estudia accesibilidad. Errores comunes: any en props, children opcional sin razón, handlers sin tipo y genéricos que ocultan errores. Fuentes oficiales: https://react.dev/learn/typescript y https://www.typescriptlang.org/docs/.
**¿Por qué es importante?** Porque los tipos convierten contratos de UI en feedback temprano y documentación ejecutable.
**Evidencia de aprendizaje:** entrega props, hook, evento, error y corrección; explica el resultado y conserva la salida.
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
