## React Hook Form

```jsx
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(datos => crearUsuario(datos))}>
  <input {...register('email', { required: 'El email es obligatorio' })} />
  {errors.email && <span>{errors.email.message}</span>}
</form>
```

React Hook Form evita re-renderizar todo el formulario en cada tecla (a diferencia de manejar cada campo con `useState` individual), porque los inputs se registran de forma "no controlada" por debajo.

## Validación con zod + resolver

```jsx
const schema = z.object({ email: z.string().email(), edad: z.number().min(18) });
useForm({ resolver: zodResolver(schema) });
```

## Formularios multi-paso

```jsx
const [paso, setPaso] = useState(1);
const [datos, setDatos] = useState({});

function siguientePaso(datosDelPaso) {
  setDatos(prev => ({ ...prev, ...datosDelPaso }));
  setPaso(p => p + 1);
}
```

Cada paso es un sub-formulario que actualiza el estado compartido `datos` antes de avanzar — al volver atrás, los campos siguen llenos.

## Eventos sintéticos

React envuelve los eventos nativos del DOM en un `SyntheticEvent` con la misma API en todos los navegadores — por eso `e.preventDefault()` y `e.target.value` funcionan igual sin importar el motor del navegador.
