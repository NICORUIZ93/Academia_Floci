# Módulo 4: Context API y composición


## Aprende construyendo

### Tema 1: createContext y useContext

#### Paso 1 · Objetivo y preparación
Al finalizar podrás compartir dependencias React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, tema, usuario y configuración de entregas se consumen en varias pantallas; el contexto debe evitar prop drilling sin ocultar dependencias.

#### Paso 3 · Teoría, modelo mental y analogía
createContext define un canal y useContext lo consume; el Provider establece valor y alcance. Context no es automáticamente un store para todo. Componentes compuestos y hooks personalizados reutilizan comportamiento con contratos claros. La analogía es una oficina: una recepción comparte credenciales de visita, pero no administra toda la contabilidad del edificio.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m4
cd ejemplo-react-m4
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/context/DeliveryContext.tsx y un Provider; consume el contexto en una tarjeta y muestra valor por defecto y valor real.

#### Paso 5 · Práctica guiada
Pista: renderiza deliberadamente el consumidor sin Provider para provocar un fallo deliberado de configuración; diagnostica el valor undefined y corrígelo. Resultado esperado: componente con dependencia explícita.

#### Paso 6 · Práctica independiente
Crea un hook useDelivery, un componente compuesto con slots y una comparación documentada entre Context y store externo.

#### Paso 7 · Cierre y evidencia
Guarda árbol, código y captura; como siguiente paso estudia routing. Errores comunes: contexto mutable gigante, valores nuevos en cada render, hooks fuera de componentes y dependencias implícitas. Fuentes oficiales: https://react.dev/learn/passing-data-deeply-with-context y https://react.dev/learn/reusing-logic-with-custom-hooks.
**¿Por qué es importante?** Porque compartir datos sin diseñar el alcance crea acoplamiento invisible.
**Evidencia de aprendizaje:** entrega Provider, consumidor, fallo, hook y decisión.
**Conceptos clave:** proveedor y consumidor, evitar prop drilling.

`createContext('claro')` crea un objeto Context con un valor por defecto, que luego se provee a un subárbol completo de componentes mediante un componente `Provider` (`<ThemeContext.Provider value={{ tema, setTema }}>`) envolviendo esa parte de la aplicación; cualquier componente descendiente de ese Provider, sin importar cuántos niveles de anidamiento existan entre ambos, puede leer ese valor directamente con `useContext(ThemeContext)`, sin que ningún componente intermedio entre el Provider y el consumidor final necesite recibir, conocer, ni reenviar manualmente ese valor a través de sus propias props.

Esto resuelve directamente el problema conocido como "prop drilling": sin Context, compartir un valor entre un componente ancestro y otro descendiente lejano en el árbol requeriría pasar ese valor explícitamente como prop a través de cada componente intermedio en el camino entre ambos, incluso si esos componentes intermedios no usan ese valor para nada propio, simplemente lo reenvían hacia abajo — un acoplamiento innecesario que hace que cambiar la forma de ese valor compartido, o insertar un nuevo componente intermedio en el árbol, requiera modificar potencialmente muchos componentes que no tienen ninguna relación conceptual real con ese dato compartido, más allá de estar geográficamente ubicados entre el proveedor y el consumidor final.

**Analogía:** Context es como un anuncio por altavoz que llega directamente a cualquier persona dentro de un edificio específico, sin necesidad de que cada persona en cada piso intermedio tenga que repetir manualmente el mensaje al piso siguiente para que finalmente llegue a su destinatario real.

**¿Por qué es importante?** Context permite que un componente lea un valor compartido sin que cada componente intermedio en el árbol tenga que reenviarlo manualmente, evitando el acoplamiento innecesario del prop drilling.

**Código del ejemplo:**

```jsx
const ThemeContext = createContext('claro');

function App() {
  const [tema, setTema] = useState('claro');
  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      <Pagina />
    </ThemeContext.Provider>
  );
}

function BotonToggle() {
  const { tema, setTema } = useContext(ThemeContext); // sin pasar props por cada nivel intermedio
  return <button onClick={() => setTema(t => t === 'claro' ? 'oscuro' : 'claro')}>{tema}</button>;
}
```

### Tema 2: Cuándo Context es suficiente y cuándo no

#### Paso 1 · Objetivo y preparación
Al finalizar podrás compartir dependencias React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, tema, usuario y configuración de entregas se consumen en varias pantallas; el contexto debe evitar prop drilling sin ocultar dependencias.

#### Paso 3 · Teoría, modelo mental y analogía
createContext define un canal y useContext lo consume; el Provider establece valor y alcance. Context no es automáticamente un store para todo. Componentes compuestos y hooks personalizados reutilizan comportamiento con contratos claros. La analogía es una oficina: una recepción comparte credenciales de visita, pero no administra toda la contabilidad del edificio.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m4
cd ejemplo-react-m4
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/context/DeliveryContext.tsx y un Provider; consume el contexto en una tarjeta y muestra valor por defecto y valor real.

#### Paso 5 · Práctica guiada
Pista: renderiza deliberadamente el consumidor sin Provider para provocar un fallo deliberado de configuración; diagnostica el valor undefined y corrígelo. Resultado esperado: componente con dependencia explícita.

#### Paso 6 · Práctica independiente
Crea un hook useDelivery, un componente compuesto con slots y una comparación documentada entre Context y store externo.

#### Paso 7 · Cierre y evidencia
Guarda árbol, código y captura; como siguiente paso estudia routing. Errores comunes: contexto mutable gigante, valores nuevos en cada render, hooks fuera de componentes y dependencias implícitas. Fuentes oficiales: https://react.dev/learn/passing-data-deeply-with-context y https://react.dev/learn/reusing-logic-with-custom-hooks.
**¿Por qué es importante?** Porque compartir datos sin diseñar el alcance crea acoplamiento invisible.
**Evidencia de aprendizaje:** entrega Provider, consumidor, fallo, hook y decisión.
**Conceptos clave:** frecuencia de cambio del valor, re-renders de todos los consumidores.

Context resuelve bien el caso de valores que cambian con poca frecuencia relativa (el tema visual de la aplicación, el idioma seleccionado, la identidad del usuario autenticado) y que necesitan leerse desde muchos lugares distintos y potencialmente lejanos del árbol de componentes, dado que el costo de un re-render ocasional de todos los consumidores de ese Context (cada vez que el valor provisto cambia, absolutamente todos los componentes que consumen ese Context con `useContext` se re-renderizan, sin distinción de granularidad más fina) es perfectamente aceptable cuando esos cambios son infrecuentes.

Ese mismo comportamiento se vuelve problemático cuando el valor compartido cambia con mucha frecuencia (por ejemplo, el valor de un input que cambia en cada tecla) y es consumido por muchos componentes distintos: cada cambio re-renderizaría absolutamente todos esos consumidores, incluso aquellos que, en la práctica, solo necesitarían actualizarse ante una porción específica y más granular de ese cambio, no ante cualquier cambio del Context completo, un problema de rendimiento que empeora proporcionalmente a la frecuencia del cambio y a la cantidad de consumidores, y que librerías dedicadas de estado como Zustand (Módulo 7) resuelven de forma más granular, permitiendo a cada componente suscribirse selectivamente solo a la porción específica del estado que efectivamente necesita, sin re-renderizarse ante cambios de otras porciones no relacionadas.

**Analogía:** Context es como un tablón de anuncios comunitario, perfecto para avisos poco frecuentes que interesan a todo el vecindario (el tema, el idioma); para actualizaciones extremadamente frecuentes que solo interesan a ciertos vecinos específicos, un tablón general que notifica a todo el vecindario ante cada actualización se vuelve ruidoso e ineficiente, siendo preferible un sistema de suscripción más selectivo y granular.

**¿Por qué es importante?** Context es apropiado para valores que cambian con poca frecuencia consumidos ampliamente; para estado que cambia con mucha frecuencia y es consumido selectivamente, una librería con suscripción granular como Zustand evita re-renders innecesarios de consumidores no relacionados con el cambio específico.

**Diagrama:**

```
Context apropiado: tema, idioma, usuario autenticado (cambia poco, se lee en muchos lugares)
Context problemático: valor de un input en cada tecla (cambia mucho, re-renderiza TODOS los consumidores)
```

### Tema 3: Componentes compuestos, render props y hooks personalizados

#### Paso 1 · Objetivo y preparación
Al finalizar podrás compartir dependencias React desde cero. Prerrequisitos: Node.js LTS, npm y editor. Verifica npm --version.

#### Paso 2 · Contexto y caso real
En un caso real, tema, usuario y configuración de entregas se consumen en varias pantallas; el contexto debe evitar prop drilling sin ocultar dependencias.

#### Paso 3 · Teoría, modelo mental y analogía
createContext define un canal y useContext lo consume; el Provider establece valor y alcance. Context no es automáticamente un store para todo. Componentes compuestos y hooks personalizados reutilizan comportamiento con contratos claros. La analogía es una oficina: una recepción comparte credenciales de visita, pero no administra toda la contabilidad del edificio.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-react-m4
cd ejemplo-react-m4
npm create vite@latest app -- --template react-ts
cd app
npm install
npm run dev
```
Crea src/context/DeliveryContext.tsx y un Provider; consume el contexto en una tarjeta y muestra valor por defecto y valor real.

#### Paso 5 · Práctica guiada
Pista: renderiza deliberadamente el consumidor sin Provider para provocar un fallo deliberado de configuración; diagnostica el valor undefined y corrígelo. Resultado esperado: componente con dependencia explícita.

#### Paso 6 · Práctica independiente
Crea un hook useDelivery, un componente compuesto con slots y una comparación documentada entre Context y store externo.

#### Paso 7 · Cierre y evidencia
Guarda árbol, código y captura; como siguiente paso estudia routing. Errores comunes: contexto mutable gigante, valores nuevos en cada render, hooks fuera de componentes y dependencias implícitas. Fuentes oficiales: https://react.dev/learn/passing-data-deeply-with-context y https://react.dev/learn/reusing-logic-with-custom-hooks.
**¿Por qué es importante?** Porque compartir datos sin diseñar el alcance crea acoplamiento invisible.
**Evidencia de aprendizaje:** entrega Provider, consumidor, fallo, hook y decisión.
**Conceptos clave:** coordinación implícita vía Context interno, alternativas históricas de reutilización de lógica.

El patrón de componentes compuestos usa un Context interno y privado (no expuesto directamente al usuario del componente) para coordinar el estado compartido entre un componente contenedor y sus componentes hijos relacionados, sin que el usuario final del componente necesite pasar props de coordinación manualmente: `<Tabs><Tabs.Tab label="Perfil">...</Tabs.Tab></Tabs>` funciona porque `Tabs` provee internamente un Context que sus propios componentes hijos `Tabs.Tab` consumen automáticamente, coordinando cuál pestaña está activa sin que el código que usa `Tabs` tenga que gestionar ese estado explícitamente por su cuenta.

Antes de que los hooks existieran (previo a React 16.8), dos patrones eran comunes para reutilizar lógica con estado entre componentes distintos: render props (un componente que recibe una función como prop y la invoca pasándole cierto estado interno, `<DataFetcher render={data => <Vista data={data} />} />`) y componentes de orden superior (funciones que envuelven un componente para inyectarle props adicionales). Los hooks personalizados (funciones que empiezan con `use` y pueden llamar a otros hooks internamente) reemplazaron en gran medida ambos patrones anteriores, permitiendo extraer y reutilizar lógica con estado de forma más directa y sin la anidación adicional de componentes envolventes que ambos patrones anteriores requerían.

**Analogía:** el patrón de componentes compuestos es como un equipo de trabajo donde los miembros se coordinan internamente mediante un canal de comunicación privado del propio equipo, sin que el cliente externo que contrata al equipo necesite coordinar manualmente la comunicación interna entre sus miembros.

**¿Por qué es importante?** Los componentes compuestos ofrecen una API declarativa y limpia para el usuario final del componente, ocultando la coordinación interna necesaria; los hooks personalizados reemplazaron patrones anteriores más verbosos (render props, HOCs) para reutilizar lógica con estado.

**Código del ejemplo:**

```jsx
<Tabs>
  <Tabs.Tab label="Perfil"><Perfil /></Tabs.Tab>
  <Tabs.Tab label="Ajustes"><Ajustes /></Tabs.Tab>
</Tabs>
// Tabs provee un Context interno que Tabs.Tab consume, sin coordinación manual del usuario
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** implementar un theme switcher completo con Context, y un componente compuesto Tabs/Tab.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `ThemeContext` con `ThemeProvider` | Ver Tema 1 | Envuelve la app completa |
| 2 | Consumir el contexto 3 niveles abajo | Ver Tema 1 | Sin prop drilling |
| 3 | Implementar el toggle de tema | Ver Tema 1 | Verifica que todos los consumidores se actualizan |
| 4 | Construir `Tabs`/`Tabs.Tab` compuesto | Ver Tema 3 | Comparte estado interno vía Context |

**Verificación:** el laboratorio se considera exitoso si el cambio de tema se refleja instantáneamente en todos los componentes consumidores sin importar su profundidad en el árbol, y si `Tabs`/`Tabs.Tab` coordinan la pestaña activa sin que el código que los usa gestione ese estado manualmente.

**Errores comunes y soluciones**

- **Usar Context para estado que cambia muy frecuentemente y es consumido por muchos componentes.** Considera Zustand (Módulo 7) para ese caso.
- **Exponer el Context interno de un componente compuesto directamente al usuario.** Mantenlo privado, coordinando internamente sin exponer detalles de implementación.
- **Olvidar envolver la aplicación (o el subárbol relevante) con el Provider.** Sin el Provider, `useContext` devuelve el valor por defecto, no el valor esperado.

---
