# Módulo 3: Formularios y eventos


## Aprende construyendo

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
