## Buscador con debounce y switchMap

```ts
busqueda = new FormControl('');

resultados = toSignal(
  this.busqueda.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(texto => this.api.buscar(texto)) // cancela la petición anterior automáticamente
  ),
  { initialValue: [] }
);
```

`switchMap` cancela el Observable interno anterior cada vez que llega un nuevo valor — ideal para búsquedas, donde solo te interesa la respuesta a la última consulta.

## combineLatest

```ts
const filtroYOrden$ = combineLatest([filtro$, orden$]).pipe(
  map(([filtro, orden]) => aplicarFiltroYOrden(lista, filtro, orden))
);
```

Se recalcula cada vez que CUALQUIERA de las dos fuentes emite un nuevo valor.

## async pipe en vez de subscribe manual

```html
<ul>
  @for (item of resultados$ | async; track item.id) {
    <li>{{ item.nombre }}</li>
  }
</ul>
```

El `async` pipe se suscribe y, crucialmente, **se desuscribe automáticamente** cuando el componente se destruye — evitando la fuga de memoria clásica de un `subscribe()` sin `unsubscribe()`.

## Puente con Signals

```ts
const resultadosSignal = toSignal(resultados$, { initialValue: [] });
const observableDeVuelta = toObservable(unSignal);
```
