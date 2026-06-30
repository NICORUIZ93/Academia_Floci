## fs/promises vs callbacks

```js
import { readFile } from "node:fs/promises";
const contenido = await readFile("datos.csv", "utf-8"); // moderno, con async/await

import fs from "node:fs";
fs.readFile("datos.csv", "utf-8", (err, data) => { /* estilo clásico de Node */ });
```

## Streams: legibles, escribibles y transform

```js
import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const csvALinea = new Transform({
  transform(chunk, _enc, callback) {
    const json = csvLineaAJson(chunk.toString());
    callback(null, json + "\n");
  },
});

await pipeline(
  createReadStream("entrada.csv"),
  csvALinea,
  createWriteStream("salida.jsonl")
);
```

`pipeline()` conecta los streams y, a diferencia de encadenar `.pipe()` manualmente, propaga errores y cierra todos los streams correctamente si alguno falla.

## Backpressure

Si el destino (ej. disco lento) no puede recibir datos tan rápido como la fuente los produce, el stream de lectura se pausa automáticamente hasta que el destino esté listo. Esto evita que un archivo de 10 GB explote la memoria RAM del proceso — los datos fluyen en chunks pequeños, no todos de una vez.
