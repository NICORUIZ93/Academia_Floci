## Queries por rol, no por clase CSS

```jsx
render(<Formulario />);
const boton = screen.getByRole('button', { name: /enviar/i }); // como lo "vería" un usuario/lector de pantalla
await userEvent.click(boton);
expect(screen.getByText(/enviado con éxito/i)).toBeInTheDocument();
```

Testing Library evita deliberadamente `getByClassName` o selectores de implementación — si refactorizas el HTML interno sin cambiar el comportamiento visible, el test sigue pasando.

## Mock Service Worker (MSW)

```js
const server = setupServer(
  http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nombre: 'Ana' }]))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

MSW intercepta las peticiones a nivel de red (no parchea `fetch` directamente), por lo que tu código de producción no necesita saber que está siendo testeado.

## Testing de hooks personalizados

```jsx
const { result } = renderHook(() => useContador());
act(() => result.current.incrementar());
expect(result.current.valor).toBe(1);
```
