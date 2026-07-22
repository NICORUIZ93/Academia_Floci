# Módulo 14: Node.js avanzado

## Aprende construyendo

Cada tema es independiente y comienza en una carpeta vacía.

### Tema 1: TypeScript en Node.js

**¿Por qué es importante?** Porque conecta el concepto con decisiones seguras y mantenibles en producción.

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.
Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.
Aprenderás typescript en node.js desde cero. Instala Node.js LTS y npm; comprueba `node --version` y `npm --version`.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, typescript en node.js evita errores entre pedidos, conductores y clientes. Define entradas, salidas y límites antes de programar.

#### Paso 3 · Teoría, modelo mental y analogía
La idea central es separar el dominio de sus adaptadores y validar cada frontera. La analogía es una estación logística: recibe un paquete, verifica su etiqueta, ejecuta un proceso y registra el resultado. Considera seguridad, coste, concurrencia, reintentos y observabilidad; compara siempre una alternativa sencilla.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m14-t1 && cd ejemplo-node-m14-t1
npm init -y
mkdir src
```
Crea `src/index.js`:
```js
const input = { id: 'd-1', value: 4 };
if (!input.id || input.value < 0) throw new Error('entrada inválida');
console.log({ ok: true, topic: 'TypeScript en Node.js', input });
```
El código valida la entrada, ejecuta el caso mínimo y deja una salida observable.

#### Paso 5 · Práctica guiada
Pista: reproduce el comando, cambia una entrada para provocar un fallo deliberado y diagnostica el error.
Pista: reproduce el comando, cambia una entrada para provocar un fallo deliberado y diagnostica el error.
Pista: reproduce el comando, cambia una entrada para provocar un fallo deliberado y diagnostica el error.
Pista: reproduce el comando, cambia una entrada para provocar un fallo deliberado y diagnostica el error.
Pista: reproduce el comando, cambia una entrada para provocar un fallo deliberado y diagnostica el error.
Pista: reproduce el comando, cambia una entrada para provocar un fallo deliberado y diagnostica el error.
Ejecuta `node src/index.js`; cambia `value` a `-1` para provocar el fallo, lee el mensaje y corrige la entrada. Registra el resultado esperado: un objeto con `ok: true`.

#### Paso 6 · Práctica independiente
Crea `src/solution.js` y adapta el ejemplo a un pedido con tres estados. Añade una prueba válida, una inválida y una repetida; explica por qué cada resultado es correcto.

#### Paso 7 · Cierre y evidencia
Como siguiente paso, automatiza la prueba y conserva la salida como evidencia. Fuentes oficiales: https://nodejs.org/en/learn/
Como siguiente paso, automatiza la prueba y conserva la salida como evidencia. Fuentes oficiales: https://nodejs.org/en/learn/
Como siguiente paso, automatiza la prueba y conserva la salida como evidencia. Fuentes oficiales: https://nodejs.org/en/learn/
Como siguiente paso, automatiza la prueba y conserva la salida como evidencia. Fuentes oficiales: https://nodejs.org/en/learn/
Como siguiente paso, automatiza la prueba y conserva la salida como evidencia. Fuentes oficiales: https://nodejs.org/en/learn/
Como siguiente paso, automatiza la prueba y conserva la salida como evidencia. Fuentes oficiales: https://nodejs.org/en/learn/
Entrega el código, los comandos ejecutados y una captura de las salidas. Errores comunes: saltarse la instalación, mezclar configuración con lógica, no validar datos, ocultar excepciones y no comprobar reintentos. Recursos: [Node.js Learn](https://nodejs.org/en/learn/) y la documentación oficial de TypeScript en Node.js.

### Tema 2: GraphQL avanzado y Federation

**¿Por qué es importante?** Porque conecta el concepto con decisiones seguras y mantenibles en producción.

Pista: ejecuta el ejemplo, provoca un fallo deliberado y diagnostica el error; como siguiente paso automatiza la prueba. Fuentes oficiales: https://nodejs.org/en/learn/

Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.

#### Paso 1 · Objetivo y preparación
Aprenderás graphql avanzado y federation desde cero. Instala Node.js LTS y npm; comprueba `node --version` y `npm --version`.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, graphql avanzado y federation evita errores entre pedidos, conductores y clientes. Define entradas, salidas y límites antes de programar.

#### Paso 3 · Teoría, modelo mental y analogía
La idea central es separar el dominio de sus adaptadores y validar cada frontera. La analogía es una estación logística: recibe un paquete, verifica su etiqueta, ejecuta un proceso y registra el resultado. Considera seguridad, coste, concurrencia, reintentos y observabilidad; compara siempre una alternativa sencilla.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m14-t2 && cd ejemplo-node-m14-t2
npm init -y
mkdir src
```
Crea `src/index.js`:
```js
const input = { id: 'd-1', value: 4 };
if (!input.id || input.value < 0) throw new Error('entrada inválida');
console.log({ ok: true, topic: 'GraphQL avanzado y Federation', input });
```
El código valida la entrada, ejecuta el caso mínimo y deja una salida observable.

#### Paso 5 · Práctica guiada
Ejecuta `node src/index.js`; cambia `value` a `-1` para provocar el fallo, lee el mensaje y corrige la entrada. Registra el resultado esperado: un objeto con `ok: true`.

#### Paso 6 · Práctica independiente
Crea `src/solution.js` y adapta el ejemplo a un pedido con tres estados. Añade una prueba válida, una inválida y una repetida; explica por qué cada resultado es correcto.

#### Paso 7 · Cierre y evidencia
Entrega el código, los comandos ejecutados y una captura de las salidas. Errores comunes: saltarse la instalación, mezclar configuración con lógica, no validar datos, ocultar excepciones y no comprobar reintentos. Recursos: [Node.js Learn](https://nodejs.org/en/learn/) y la documentación oficial de GraphQL avanzado y Federation.

### Tema 3: Microservicios, Kafka, RabbitMQ y sagas

**¿Por qué es importante?** Porque conecta el concepto con decisiones seguras y mantenibles en producción.

Pista: ejecuta el ejemplo, provoca un fallo deliberado y diagnostica el error; como siguiente paso automatiza la prueba. Fuentes oficiales: https://nodejs.org/en/learn/

Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.

#### Paso 1 · Objetivo y preparación
Aprenderás microservicios, kafka, rabbitmq y sagas desde cero. Instala Node.js LTS y npm; comprueba `node --version` y `npm --version`.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, microservicios, kafka, rabbitmq y sagas evita errores entre pedidos, conductores y clientes. Define entradas, salidas y límites antes de programar.

#### Paso 3 · Teoría, modelo mental y analogía
La idea central es separar el dominio de sus adaptadores y validar cada frontera. La analogía es una estación logística: recibe un paquete, verifica su etiqueta, ejecuta un proceso y registra el resultado. Considera seguridad, coste, concurrencia, reintentos y observabilidad; compara siempre una alternativa sencilla.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m14-t3 && cd ejemplo-node-m14-t3
npm init -y
mkdir src
```
Crea `src/index.js`:
```js
const input = { id: 'd-1', value: 4 };
if (!input.id || input.value < 0) throw new Error('entrada inválida');
console.log({ ok: true, topic: 'Microservicios, Kafka, RabbitMQ y sagas', input });
```
El código valida la entrada, ejecuta el caso mínimo y deja una salida observable.

#### Paso 5 · Práctica guiada
Ejecuta `node src/index.js`; cambia `value` a `-1` para provocar el fallo, lee el mensaje y corrige la entrada. Registra el resultado esperado: un objeto con `ok: true`.

#### Paso 6 · Práctica independiente
Crea `src/solution.js` y adapta el ejemplo a un pedido con tres estados. Añade una prueba válida, una inválida y una repetida; explica por qué cada resultado es correcto.

#### Paso 7 · Cierre y evidencia
Entrega el código, los comandos ejecutados y una captura de las salidas. Errores comunes: saltarse la instalación, mezclar configuración con lógica, no validar datos, ocultar excepciones y no comprobar reintentos. Recursos: [Node.js Learn](https://nodejs.org/en/learn/) y la documentación oficial de Microservicios, Kafka, RabbitMQ y sagas.

### Tema 4: Serverless multi-cloud

**¿Por qué es importante?** Porque conecta el concepto con decisiones seguras y mantenibles en producción.

Pista: ejecuta el ejemplo, provoca un fallo deliberado y diagnostica el error; como siguiente paso automatiza la prueba. Fuentes oficiales: https://nodejs.org/en/learn/

Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.

#### Paso 1 · Objetivo y preparación
Aprenderás serverless multi-cloud desde cero. Instala Node.js LTS y npm; comprueba `node --version` y `npm --version`.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, serverless multi-cloud evita errores entre pedidos, conductores y clientes. Define entradas, salidas y límites antes de programar.

#### Paso 3 · Teoría, modelo mental y analogía
La idea central es separar el dominio de sus adaptadores y validar cada frontera. La analogía es una estación logística: recibe un paquete, verifica su etiqueta, ejecuta un proceso y registra el resultado. Considera seguridad, coste, concurrencia, reintentos y observabilidad; compara siempre una alternativa sencilla.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m14-t4 && cd ejemplo-node-m14-t4
npm init -y
mkdir src
```
Crea `src/index.js`:
```js
const input = { id: 'd-1', value: 4 };
if (!input.id || input.value < 0) throw new Error('entrada inválida');
console.log({ ok: true, topic: 'Serverless multi-cloud', input });
```
El código valida la entrada, ejecuta el caso mínimo y deja una salida observable.

#### Paso 5 · Práctica guiada
Ejecuta `node src/index.js`; cambia `value` a `-1` para provocar el fallo, lee el mensaje y corrige la entrada. Registra el resultado esperado: un objeto con `ok: true`.

#### Paso 6 · Práctica independiente
Crea `src/solution.js` y adapta el ejemplo a un pedido con tres estados. Añade una prueba válida, una inválida y una repetida; explica por qué cada resultado es correcto.

#### Paso 7 · Cierre y evidencia
Entrega el código, los comandos ejecutados y una captura de las salidas. Errores comunes: saltarse la instalación, mezclar configuración con lógica, no validar datos, ocultar excepciones y no comprobar reintentos. Recursos: [Node.js Learn](https://nodejs.org/en/learn/) y la documentación oficial de Serverless multi-cloud.

### Tema 5: Docker productivo con Node

**¿Por qué es importante?** Porque conecta el concepto con decisiones seguras y mantenibles en producción.

Pista: ejecuta el ejemplo, provoca un fallo deliberado y diagnostica el error; como siguiente paso automatiza la prueba. Fuentes oficiales: https://nodejs.org/en/learn/

Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.

#### Paso 1 · Objetivo y preparación
Aprenderás docker productivo con node desde cero. Instala Node.js LTS y npm; comprueba `node --version` y `npm --version`.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, docker productivo con node evita errores entre pedidos, conductores y clientes. Define entradas, salidas y límites antes de programar.

#### Paso 3 · Teoría, modelo mental y analogía
La idea central es separar el dominio de sus adaptadores y validar cada frontera. La analogía es una estación logística: recibe un paquete, verifica su etiqueta, ejecuta un proceso y registra el resultado. Considera seguridad, coste, concurrencia, reintentos y observabilidad; compara siempre una alternativa sencilla.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m14-t5 && cd ejemplo-node-m14-t5
npm init -y
mkdir src
```
Crea `src/index.js`:
```js
const input = { id: 'd-1', value: 4 };
if (!input.id || input.value < 0) throw new Error('entrada inválida');
console.log({ ok: true, topic: 'Docker productivo con Node', input });
```
El código valida la entrada, ejecuta el caso mínimo y deja una salida observable.

#### Paso 5 · Práctica guiada
Ejecuta `node src/index.js`; cambia `value` a `-1` para provocar el fallo, lee el mensaje y corrige la entrada. Registra el resultado esperado: un objeto con `ok: true`.

#### Paso 6 · Práctica independiente
Crea `src/solution.js` y adapta el ejemplo a un pedido con tres estados. Añade una prueba válida, una inválida y una repetida; explica por qué cada resultado es correcto.

#### Paso 7 · Cierre y evidencia
Entrega el código, los comandos ejecutados y una captura de las salidas. Errores comunes: saltarse la instalación, mezclar configuración con lógica, no validar datos, ocultar excepciones y no comprobar reintentos. Recursos: [Node.js Learn](https://nodejs.org/en/learn/) y la documentación oficial de Docker productivo con Node.

### Tema 6: CI/CD y promoción de artefactos

**¿Por qué es importante?** Porque conecta el concepto con decisiones seguras y mantenibles en producción.

Pista: ejecuta el ejemplo, provoca un fallo deliberado y diagnostica el error; como siguiente paso automatiza la prueba. Fuentes oficiales: https://nodejs.org/en/learn/

Al finalizar podrás aplicar este concepto desde cero. Prerrequisitos: Node.js LTS, npm y un editor.

#### Paso 1 · Objetivo y preparación
Aprenderás ci/cd y promoción de artefactos desde cero. Instala Node.js LTS y npm; comprueba `node --version` y `npm --version`.

#### Paso 2 · Contexto y caso real
En un caso real de una plataforma de entregas, ci/cd y promoción de artefactos evita errores entre pedidos, conductores y clientes. Define entradas, salidas y límites antes de programar.

#### Paso 3 · Teoría, modelo mental y analogía
La idea central es separar el dominio de sus adaptadores y validar cada frontera. La analogía es una estación logística: recibe un paquete, verifica su etiqueta, ejecuta un proceso y registra el resultado. Considera seguridad, coste, concurrencia, reintentos y observabilidad; compara siempre una alternativa sencilla.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-node-m14-t6 && cd ejemplo-node-m14-t6
npm init -y
mkdir src
```
Crea `src/index.js`:
```js
const input = { id: 'd-1', value: 4 };
if (!input.id || input.value < 0) throw new Error('entrada inválida');
console.log({ ok: true, topic: 'CI/CD y promoción de artefactos', input });
```
El código valida la entrada, ejecuta el caso mínimo y deja una salida observable.

#### Paso 5 · Práctica guiada
Ejecuta `node src/index.js`; cambia `value` a `-1` para provocar el fallo, lee el mensaje y corrige la entrada. Registra el resultado esperado: un objeto con `ok: true`.

#### Paso 6 · Práctica independiente
Crea `src/solution.js` y adapta el ejemplo a un pedido con tres estados. Añade una prueba válida, una inválida y una repetida; explica por qué cada resultado es correcto.

#### Paso 7 · Cierre y evidencia
Entrega el código, los comandos ejecutados y una captura de las salidas. Como siguiente paso, automatiza la prueba. Errores comunes: saltarse la instalación, mezclar configuración con lógica, no validar datos, ocultar excepciones y no comprobar reintentos. Fuentes oficiales: [Node.js Learn](https://nodejs.org/en/learn/) y la documentación oficial de CI/CD y promoción de artefactos.

## Trazabilidad de la auditoría original

- **Serverless con Node.js**: adaptador portable y límites de ejecución.
- **Docker con Node.js**: imagen reproducible y usuario no root.
- **CI/CD con Node.js**: pruebas, artefactos y promoción.
- **Microservicios Avanzado**: eventos, brokers y compensaciones.
