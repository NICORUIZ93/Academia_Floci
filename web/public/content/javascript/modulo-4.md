## map, filter, reduce

Los tres métodos funcionales que reemplazan la mayoría de loops manuales:

```js
const pedidos = [
  { cliente: "Ana", monto: 120 },
  { cliente: "Beto", monto: 80 },
  { cliente: "Ana", monto: 40 },
];

const montos = pedidos.map(p => p.monto);              // [120, 80, 40]
const grandes = pedidos.filter(p => p.monto > 50);       // 2 pedidos
const totalPorCliente = pedidos.reduce((acc, p) => {
  acc[p.cliente] = (acc[p.cliente] ?? 0) + p.monto;
  return acc;
}, {}); // { Ana: 160, Beto: 80 }
```

`find` devuelve el primer elemento que cumple una condición; `some`/`every` devuelven booleanos.

## Set y Map

`Set` almacena valores únicos; `Map` permite claves de cualquier tipo (no solo strings) y mantiene el orden de inserción de forma predecible.

```js
const unicos = [...new Set([1, 2, 2, 3, 3, 3])]; // [1, 2, 3]

const contador = new Map();
for (const palabra of texto.split(" ")) {
  contador.set(palabra, (contador.get(palabra) ?? 0) + 1);
}
```

## Inmutabilidad con spread

Actualizar sin mutar el original facilita rastrear bugs (el estado anterior sigue intacto para comparar):

```js
const usuario = { nombre: "Ana", direccion: { ciudad: "Lima" } };
const actualizado = {
  ...usuario,
  direccion: { ...usuario.direccion, ciudad: "Bogotá" },
};
// usuario.direccion.ciudad sigue siendo "Lima"
```
