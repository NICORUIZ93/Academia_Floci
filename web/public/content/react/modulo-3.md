# Módulo 3: Formularios y eventos

## Sílabo

**Objetivo general**

Manejar entradas de usuario complejas sin perder el control del estado, usando React Hook Form para formularios de tamaño real, validación con zod, formularios multi-paso, y comprendiendo los eventos sintéticos de React.

**Objetivos específicos**

1. Construir un formulario con React Hook Form (`register`, `handleSubmit`, `errors`).
2. Conectar un schema de validación de zod mediante un resolver.
3. Implementar un formulario multi-paso que conserve datos entre pasos.
4. Manejar eventos sintéticos, incluyendo `preventDefault`.
5. Explicar qué problema de rendimiento resuelve React Hook Form frente a `useState` por campo.

**Contenido**

- React Hook Form: `register`, `handleSubmit`, `errors`.
- Validación con un schema de zod y `resolver`.
- Formularios multi-paso.
- Eventos sintéticos.

**Evaluación**

Formulario multi-paso con validación y persistencia de datos entre pasos, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Formulario multi-paso con validación y persistencia de datos entre pasos, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-3/
├─ tests/
├─ docs/decisions/
├─ evidence/module-3/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. React Hook Form y el problema del re-render por tecla | `src/features/module-3/topic-1-react-hook-form-y-el-problema-del-re-render-por-tecla.tsx` | prueba + salida observable |
| 2. Validación con zod y formularios multi-paso | `src/features/module-3/topic-2-validacion-con-zod-y-formularios-multi-paso.tsx` | prueba + salida observable |
| 3. Eventos sintéticos | `src/features/module-3/topic-3-eventos-sinteticos.tsx` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/react-app`:

```bash
npm test -- --run && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Formulario multi-paso con validación y persistencia de datos entre pasos, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia una prop o respuesta a un caso vacío o erróneo; observa el estado visual y corrige desde la primera causa. Guarda en `evidence/module-3/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Formularios y eventos** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: React Hook Form y el problema del re-render por tecla

**Conceptos clave:** registro no controlado por debajo, rendimiento en formularios grandes.

Manejar cada campo de un formulario con su propio `useState` individual (el enfoque controlado estudiado en el Módulo 1) funciona perfectamente bien para formularios pequeños, pero en formularios con muchos campos, cada tecla presionada en cualquier campo dispara un re-render de todo el componente formulario completo (dado que el estado vive en ese componente padre), un costo que se vuelve mensurable cuando el formulario tiene decenas de campos, cada uno re-renderizándose innecesariamente cada vez que cualquier otro campo cambia, no solo el que efectivamente recibió la tecla.

React Hook Form (`const { register, handleSubmit, formState: { errors } } = useForm();`) resuelve este problema registrando cada input de forma "no controlada" por debajo (similar en espíritu al enfoque no controlado mencionado en el Módulo 1, gestionado internamente mediante referencias del DOM en vez de estado de React sincronizado en cada tecla): `{...register('email', { required: 'El email es obligatorio' })}` conecta el input directamente al sistema interno de la librería sin que cada tecla dispare un re-render de React, permitiendo que formularios con muchos campos permanezcan responsivos incluso a gran escala, mientras React Hook Form gestiona la validación y el estado de errores internamente y de forma eficiente.

`handleSubmit(datos => crearUsuario(datos))` recolecta todos los valores actuales del formulario solo en el momento del envío (no en cada tecla), ejecutando primero cualquier validación configurada y solo invocando la función de envío proporcionada si esa validación pasa exitosamente, con `errors` reflejando de forma reactiva cualquier error de validación encontrado, disponible para mostrarse condicionalmente junto a cada campo correspondiente.

**Analogía:** manejar cada campo con `useState` individual es como anunciar en voz alta a toda la sala cada letra que alguien escribe en cualquier formulario de la sala; React Hook Form es como dejar que cada persona escriba en su propio papel privado, y solo recolectar y anunciar el contenido completo cuando alguien efectivamente entrega su formulario terminado.

**¿Por qué es importante?** React Hook Form evita el costo de re-renderizar el formulario completo en cada tecla, un problema de rendimiento mensurable en formularios con muchos campos, sin sacrificar la capacidad de validar y reaccionar a los valores ingresados.

**Código del ejemplo:**

```jsx
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(datos => crearUsuario(datos))}>
  <input {...register('email', { required: 'El email es obligatorio' })} />
  {errors.email && <span>{errors.email.message}</span>}
</form>
```

### Tema 2: Validación con zod y formularios multi-paso

**Conceptos clave:** schema declarativo, `zodResolver`, estado compartido entre pasos.

Un schema de zod (`z.object({ email: z.string().email(), edad: z.number().min(18) })`) describe declarativamente qué forma y qué restricciones debe cumplir un objeto de datos válido, de forma similar en espíritu a los validadores declarativos de Reactive Forms estudiados en el Módulo 5 del track de Angular, pero expresado como un schema TypeScript-first reutilizable también para validar datos en otros contextos (por ejemplo, validar la misma forma de datos en el backend, Módulo 8 del track de Node.js, compartiendo literalmente el mismo schema entre cliente y servidor). Conectar ese schema a React Hook Form mediante `useForm({ resolver: zodResolver(schema) })` delega toda la lógica de validación a zod, poblando automáticamente `errors` con los mensajes correspondientes cuando el schema rechaza algún valor.

Un formulario multi-paso mantiene el estado combinado de todos los pasos en un componente padre compartido (`const [datos, setDatos] = useState({})`), donde cada paso individual es un sub-formulario independiente que, al completarse, fusiona sus propios datos con el estado acumulado existente (`setDatos(prev => ({ ...prev, ...datosDelPaso }))`) antes de avanzar al siguiente paso (`setPaso(p => p + 1)`); al retroceder a un paso anterior, ese estado combinado ya existente permite prellenar nuevamente los campos con los valores previamente ingresados, en vez de perderlos y forzar al usuario a reescribirlos desde cero.

**Analogía:** un schema de zod es como una plantilla de aduana que especifica exactamente qué documentos y en qué formato son válidos para pasar, rechazando automáticamente cualquier envío que no cumpla esos requisitos declarados; un formulario multi-paso es como llenar un formulario largo en varias hojas separadas que se van acumulando en la misma carpeta, permitiendo volver a una hoja anterior sin perder lo ya escrito en las demás.

**¿Por qué es importante?** Un schema de zod centraliza y hace reutilizable la lógica de validación, potencialmente compartida entre cliente y servidor; conservar el estado combinado entre pasos evita que el usuario pierda datos ya ingresados al navegar entre pasos de un formulario largo.

**Código del ejemplo:**

```jsx
const schema = z.object({ email: z.string().email(), edad: z.number().min(18) });
useForm({ resolver: zodResolver(schema) });

const [paso, setPaso] = useState(1);
const [datos, setDatos] = useState({});
function siguientePaso(datosDelPaso) {
  setDatos(prev => ({ ...prev, ...datosDelPaso }));
  setPaso(p => p + 1);
}
```

### Tema 3: Eventos sintéticos

**Conceptos clave:** `SyntheticEvent`, API consistente entre navegadores, `preventDefault`.

React envuelve los eventos nativos del DOM (que históricamente tenían implementaciones e interfaces ligeramente distintas entre distintos motores de navegador) en un objeto `SyntheticEvent` con una API consistente y unificada independientemente del navegador donde la aplicación se ejecute, siendo esta la razón por la que `e.preventDefault()` (para evitar el comportamiento por defecto del navegador, como recargar la página al enviar un formulario, Módulo 3 del track de JavaScript sobre el bucle de eventos y el DOM) y `e.target.value` (para leer el valor actual de un input) funcionan de forma idéntica en el código de React sin importar el motor de renderizado subyacente del navegador del usuario.

Este envoltorio sintético también permite a React optimizar internamente cómo se registran y despachan los eventos (adjuntando un único listener raíz en vez de un listener individual por cada elemento con un manejador de evento, un detalle de implementación interna que no afecta cómo se escribe el código de manejo de eventos, pero sí su eficiencia general), sin que el código de la aplicación necesite preocuparse por esos detalles internos de optimización.

**Analogía:** los eventos sintéticos son como un traductor universal que normaliza mensajes provenientes de distintos idiomas nativos (los distintos comportamientos de eventos de cada navegador) en un único idioma común y consistente, permitiendo escribir el código de manejo de eventos una única vez, sin preocuparse por las particularidades de cada navegador individual.

**¿Por qué es importante?** El envoltorio de eventos sintéticos garantiza una API de eventos consistente entre distintos motores de navegador, y permite a React optimizar internamente el registro y despacho de eventos sin afectar cómo se escribe el código de manejo de eventos.

**Código del ejemplo:**

```jsx
function manejarSubmit(e) {
  e.preventDefault(); // funciona igual en cualquier navegador
  console.log(e.target.value);
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

**Objetivo del laboratorio:** construir un formulario de registro multi-paso con React Hook Form y validación con zod.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Construir un formulario de registro con React Hook Form | Ver Tema 1 | `register`, `handleSubmit`, `errors` |
| 2 | Agregar validación con un schema de zod | Ver Tema 2 | `zodResolver(schema)` |
| 3 | Implementar el formulario multi-paso | Ver Tema 2 | Conserva datos al avanzar y retroceder |
| 4 | Manejar el evento de submit correctamente | Ver Tema 3 | `preventDefault` |

**Verificación:** el laboratorio se considera exitoso si el formulario valida correctamente según el schema de zod, y si los datos de un paso anterior permanecen visibles al retroceder y volver a avanzar.

**Errores comunes y soluciones**

- **Manejar cada campo con `useState` individual en un formulario grande.** Usa React Hook Form para evitar re-renders innecesarios en cada tecla.
- **Olvidar `preventDefault` en el submit.** Sin él, el navegador recarga la página por defecto.
- **Perder los datos de pasos anteriores al retroceder.** Fusiona siempre los datos del paso actual con el estado acumulado antes de avanzar.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué React Hook Form evita re-renders

**Enunciado:** explica qué problema de rendimiento resuelve React Hook Form frente a manejar cada campo con `useState` individual.

**Solución esperada:** con `useState` por campo, cada tecla en cualquier campo dispara un re-render del componente formulario completo; React Hook Form registra los inputs de forma no controlada por debajo, evitando ese re-render en cada tecla, un beneficio mensurable en formularios con muchos campos.

**Criterios de éxito:**
- Explica correctamente el re-render por tecla evitado por el registro no controlado de React Hook Form.

### Ejercicio 2: Eventos sintéticos

**Enunciado:** ¿por qué los eventos en React son "sintéticos" y no directamente los eventos nativos del DOM?

**Solución esperada:** React envuelve los eventos nativos en un objeto `SyntheticEvent` con una API consistente entre distintos motores de navegador, evitando que el código de la aplicación tenga que lidiar con diferencias de implementación entre navegadores, y permitiendo optimizaciones internas de registro y despacho de eventos.

**Criterios de éxito:**
- Explica correctamente la consistencia entre navegadores como razón principal de los eventos sintéticos.

### Ejercicio 3: Estado compartido en formularios multi-paso

**Enunciado:** ¿por qué el estado combinado de un formulario multi-paso vive en un componente padre compartido, en vez de en cada paso individual por separado?

**Solución esperada:** si cada paso mantuviera su propio estado aislado, los datos de un paso anterior se perderían al navegar a otro paso y desmontarse ese componente; mantener el estado combinado en un padre compartido permite prellenar los campos con los valores previamente ingresados al retroceder a un paso anterior.

**Criterios de éxito:**
- Explica correctamente la pérdida de datos que ocurriría sin estado compartido en el padre.

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

- React Hook Form evita re-renders innecesarios en cada tecla mediante registro no controlado por debajo.
- Un schema de zod centraliza y hace reutilizable la lógica de validación.
- Un formulario multi-paso conserva el estado combinado en un componente padre compartido.
- Los eventos sintéticos garantizan una API consistente entre distintos navegadores.

**Conceptos aprendidos**

- React Hook Form: `register`, `handleSubmit`, `errors`.
- Validación con zod y `zodResolver`.
- Formularios multi-paso con estado compartido.
- Eventos sintéticos.

**Próximos pasos**

En el Módulo 4 aprenderás Context API y composición: compartir estado entre componentes lejanos sin prop drilling.

**Recursos adicionales**

- Documentación de React Hook Form (react-hook-form.com) y de zod (zod.dev).
