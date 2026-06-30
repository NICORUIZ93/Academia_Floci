## createContext y useContext

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

## Cuándo Context es suficiente

Context resuelve bien estado que cambia poco (tema, idioma, usuario autenticado) y se lee en muchos lugares. Para estado que cambia muy seguido (ej. el valor de un input en cada tecla) compartido entre muchos componentes, Context puede causar re-renders innecesarios en todos los consumidores — ahí conviene una librería dedicada como Zustand.

## Componentes compuestos

```jsx
<Tabs>
  <Tabs.Tab label="Perfil"><Perfil /></Tabs.Tab>
  <Tabs.Tab label="Ajustes"><Ajustes /></Tabs.Tab>
</Tabs>
```

`Tabs` provee un Context interno que sus hijos `Tabs.Tab` consumen, sin que el usuario del componente necesite pasar props de coordinación manualmente.
