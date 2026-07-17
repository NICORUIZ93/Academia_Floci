# Módulo 4: Context API y composición

## Sílabo

**Objetivo general**

Compartir estado entre componentes lejanos en el árbol sin pasar props manualmente en cada nivel intermedio, usando Context API con criterio, y aplicar el patrón de componentes compuestos.

**Objetivos específicos**

1. Crear un Context y consumirlo con `useContext`.
2. Explicar cuándo Context es suficiente y cuándo conviene una librería dedicada.
3. Evitar el prop drilling en árboles de componentes profundos.
4. Implementar el patrón de componentes compuestos.
5. Diferenciar Context de un gestor de estado global completo como Redux.

**Contenido**

- `createContext` y `useContext`.
- Cuándo Context es suficiente y cuándo no.
- Patrón de componentes compuestos.
- Render props vs hooks personalizados.

**Evaluación**

Theme switcher (claro/oscuro) implementado con Context, sin prop drilling, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: createContext y useContext

**Conceptos clave:** proveedor y consumidor, evitar prop drilling.

`createContext('claro')` crea un objeto Context con un valor por defecto, que luego se provee a un subárbol completo de componentes mediante un componente `Provider` (`<ThemeContext.Provider value={{ tema, setTema }}>`) envolviendo esa parte de la aplicación; cualquier componente descendiente de ese Provider, sin importar cuántos niveles de anidamiento existan entre ambos, puede leer ese valor directamente con `useContext(ThemeContext)`, sin que ningún componente intermedio entre el Provider y el consumidor final necesite recibir, conocer, ni reenviar manualmente ese valor a través de sus propias props.

Esto resuelve directamente el problema conocido como "prop drilling": sin Context, compartir un valor entre un componente ancestro y otro descendiente lejano en el árbol requeriría pasar ese valor explícitamente como prop a través de cada componente intermedio en el camino entre ambos, incluso si esos componentes intermedios no usan ese valor para nada propio, simplemente lo reenvían hacia abajo — un acoplamiento innecesario que hace que cambiar la forma de ese valor compartido, o insertar un nuevo componente intermedio en el árbol, requiera modificar potencialmente muchos componentes que no tienen ninguna relación conceptual real con ese dato compartido, más allá de estar geográficamente ubicados entre el proveedor y el consumidor final.

**Analogía:** Context es como un anuncio por altavoz que llega directamente a cualquier persona dentro de un edificio específico, sin necesidad de que cada persona en cada piso intermedio tenga que repetir manualmente el mensaje al piso siguiente para que finalmente llegue a su destinatario real.

**¿Por qué es importante?** Context permite que un componente lea un valor compartido sin que cada componente intermedio en el árbol tenga que reenviarlo manualmente, evitando el acoplamiento innecesario del prop drilling.

**Diagrama:**

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

**Conceptos clave:** coordinación implícita vía Context interno, alternativas históricas de reutilización de lógica.

El patrón de componentes compuestos usa un Context interno y privado (no expuesto directamente al usuario del componente) para coordinar el estado compartido entre un componente contenedor y sus componentes hijos relacionados, sin que el usuario final del componente necesite pasar props de coordinación manualmente: `<Tabs><Tabs.Tab label="Perfil">...</Tabs.Tab></Tabs>` funciona porque `Tabs` provee internamente un Context que sus propios componentes hijos `Tabs.Tab` consumen automáticamente, coordinando cuál pestaña está activa sin que el código que usa `Tabs` tenga que gestionar ese estado explícitamente por su cuenta.

Antes de que los hooks existieran (previo a React 16.8), dos patrones eran comunes para reutilizar lógica con estado entre componentes distintos: render props (un componente que recibe una función como prop y la invoca pasándole cierto estado interno, `<DataFetcher render={data => <Vista data={data} />} />`) y componentes de orden superior (funciones que envuelven un componente para inyectarle props adicionales). Los hooks personalizados (funciones que empiezan con `use` y pueden llamar a otros hooks internamente) reemplazaron en gran medida ambos patrones anteriores, permitiendo extraer y reutilizar lógica con estado de forma más directa y sin la anidación adicional de componentes envolventes que ambos patrones anteriores requerían.

**Analogía:** el patrón de componentes compuestos es como un equipo de trabajo donde los miembros se coordinan internamente mediante un canal de comunicación privado del propio equipo, sin que el cliente externo que contrata al equipo necesite coordinar manualmente la comunicación interna entre sus miembros.

**¿Por qué es importante?** Los componentes compuestos ofrecen una API declarativa y limpia para el usuario final del componente, ocultando la coordinación interna necesaria; los hooks personalizados reemplazaron patrones anteriores más verbosos (render props, HOCs) para reutilizar lógica con estado.

**Diagrama:**

```jsx
<Tabs>
  <Tabs.Tab label="Perfil"><Perfil /></Tabs.Tab>
  <Tabs.Tab label="Ajustes"><Ajustes /></Tabs.Tab>
</Tabs>
// Tabs provee un Context interno que Tabs.Tab consume, sin coordinación manual del usuario
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

## Ejercicios de evaluación

### Ejercicio 1: Por qué Context no reemplaza a Redux completamente

**Enunciado:** explica por qué Context no es un reemplazo completo de un gestor de estado global como Redux.

**Solución esperada:** Context re-renderiza a todos sus consumidores ante cualquier cambio del valor provisto, sin granularidad de suscripción selectiva; además, Context por sí solo no ofrece herramientas de depuración de historial de cambios, middleware, ni un patrón estructurado de actions/reducers; Redux (o Redux Toolkit, Módulo 7) ofrece esas capacidades adicionales para aplicaciones que las necesitan genuinamente.

**Criterios de éxito:**
- Menciona correctamente la falta de granularidad de re-render y la ausencia de herramientas de depuración estructuradas como diferencias clave.

### Ejercicio 2: Prop drilling aceptable vs Context necesario

**Enunciado:** ¿cuándo el prop drilling es aceptable, y cuándo es momento de introducir Context?

**Solución esperada:** el prop drilling es aceptable cuando la cadena de componentes intermedios es corta (uno o dos niveles) y esos componentes intermedios de todas formas tienen alguna relación con el dato pasado; se vuelve problemático, y Context se justifica, cuando la cadena es larga y los componentes intermedios no tienen ninguna relación real con el dato, simplemente lo reenvían.

**Criterios de éxito:**
- Explica correctamente el criterio de longitud de la cadena y relación real de los componentes intermedios con el dato.

### Ejercicio 3: Componentes compuestos y Context interno

**Enunciado:** ¿por qué el Context usado internamente por `Tabs` no se expone directamente al usuario del componente?

**Solución esperada:** exponerlo directamente rompería la encapsulación del componente, permitiendo que código externo modifique el estado de coordinación interna de forma no controlada; mantenerlo privado preserva una API pública limpia (`<Tabs><Tabs.Tab>...</Tabs.Tab></Tabs>`) mientras la coordinación interna permanece como un detalle de implementación oculto.

**Criterios de éxito:**
- Explica correctamente la preservación de encapsulación y la API pública limpia resultante.

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

- Context evita el prop drilling permitiendo que un componente lea un valor compartido sin reenvío manual por cada nivel intermedio.
- Context es apropiado para valores de cambio infrecuente consumidos ampliamente; para cambios frecuentes, una librería con suscripción granular es preferible.
- El patrón de componentes compuestos usa un Context interno privado para coordinar estado sin exponer detalles de implementación.
- Los hooks personalizados reemplazaron en gran medida a render props y HOCs para reutilizar lógica con estado.

**Conceptos aprendidos**

- `createContext` y `useContext`.
- Criterios para elegir Context frente a una librería dedicada.
- Patrón de componentes compuestos.
- Render props y hooks personalizados como alternativas históricas.

**Próximos pasos**

En el Módulo 5 aprenderás React Router: rutas anidadas, loaders, rutas protegidas y code-splitting por ruta.

**Recursos adicionales**

- Documentación oficial de React (react.dev): "Passing Data Deeply with Context".
