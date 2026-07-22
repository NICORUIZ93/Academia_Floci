# Módulo 12: Apéndice: qué cambió entre versiones mayores


## Aprende construyendo

Angular no llegó a su forma actual de un solo salto. Tres quiebres reales explican por qué código de épocas distintas puede lucir tan diferente entre sí, y terminan en una regla práctica: por qué `ng update` solo garantiza migraciones de una versión mayor a la vez.

### Tema 1: Los saltos que importan

El primero no fue una actualización: en 2016, Angular 2 reemplazó por completo a AngularJS (la versión 1.x, basada en controllers y `$scope`), sin compatibilidad hacia atrás. Los conceptos, la sintaxis y la arquitectura cambiaron enteros — por eso hoy se tratan como dos proyectos distintos, con AngularJS retirado y Angular como el sucesor activo.

Los saltos posteriores sí fueron incrementales, pero dos de ellos cambiaron cómo se escribe código Angular todos los días. Angular 9 (2020) adoptó Ivy como motor de renderizado por defecto, con bundles más chicos y errores más claros, sin que la mayoría de proyectos tuviera que tocar código. Angular 14 (2022) introdujo standalone components (Módulo 0) en preview; Angular 16-17 (2023) estabilizó Signals (Módulo 2) y volvió standalone el comportamiento por defecto del CLI, consolidando ambos como el enfoque recomendado — no una alternativa experimental.

**Analogía:** el salto de AngularJS a Angular es como mudarse a otra ciudad; Ivy, standalone y Signals son renovaciones sucesivas de esa misma ciudad nueva.

**Margen:** **Ivy:** el motor de renderizado interno que compila templates a instrucciones de JavaScript. Se activó por defecto en Angular 9 sin romper compatibilidad. Ver Tema 12.2.

Para no depender de la memoria al leer código antiguo, esta función clasifica una versión según sus fronteras reales:

```ts
// angular-era.mjs
export function eraDeAngular(versionMayor) {
  if (versionMayor < 9) return 'pre-Ivy (View Engine)';
  if (versionMayor < 14) return 'Ivy estable, sin standalone';
  if (versionMayor < 16) return 'standalone en preview, sin Signals estable';
  return 'standalone por defecto, Signals estable';
}
```

```ts
// angular-era.spec.mjs — vitest
import { describe, it, expect } from 'vitest';
import { eraDeAngular } from './angular-era.mjs';

describe('eraDeAngular', () => {
  it('8 es pre-Ivy; 9 (el salto real) ya no lo es', () => {
    expect(eraDeAngular(8)).toBe('pre-Ivy (View Engine)');
    expect(eraDeAngular(9)).toBe('Ivy estable, sin standalone');
  });
  it('16 (el salto real de Signals estable) entra en la era final', () => {
    expect(eraDeAngular(16)).toBe('standalone por defecto, Signals estable');
  });
});
```

Corré `npx vitest run angular-era.spec.mjs`: ambos tests pasan porque cada frontera corresponde exactamente a un salto documentado arriba, no a una fecha aproximada. Si cambiás `< 14` por `< 15`, el primer test empieza a fallar en la versión 14 — la frontera se corrió y ahora clasifica mal un año real de la historia del framework.

#### Ejercicio verificable 1

¿En qué versión mayor de Angular se volvió Ivy el motor de renderizado por defecto?

Respuesta esperada: 9

#### Checkpoint 12.1

¿Angular 9 rompió compatibilidad con los proyectos existentes al introducir Ivy, o fue una migración transparente para la mayoría?

**Respuesta:** Fue transparente para la mayoría: Ivy se activó por defecto sin que casi ningún proyecto tuviera que cambiar código, a diferencia del salto de AngularJS a Angular 2, que sí rompió todo.

### Tema 2: Cómo leer un Angular Update Guide

Antes de migrar, [update.angular.io](https://update.angular.io) genera una checklist específica para el salto exacto que estás por dar (por ejemplo, de Angular 16 a 17): qué APIs cambiaron, qué automatiza `ng update`, y qué queda para revisión manual porque no puede resolverse sin criterio humano.

`ng` es el ejecutable de Angular CLI: la herramienta de línea de comandos que ya usaste en el Módulo 0 para crear el proyecto (`ng new`) y generar componentes (`ng generate`). Vive en el paquete `@angular/cli`, instalado como dependencia de desarrollo dentro de tu propio proyecto — no es un programa global del sistema. `update` es uno de sus subcomandos: en vez de crear archivos, reescribe los que ya tenés para adaptarlos a una versión nueva. `@angular/core` y `@angular/cli` son los dos paquetes de npm que le decís que actualice: el framework en sí y la herramienta que lo actualiza, que siempre deben avanzar juntos a la misma versión mayor. El comando real que aplica esas migraciones es `ng update @angular/core@18 @angular/cli@18` (el `@18` fija la versión mayor de destino). Antes de correrlo, agregar la bandera `--dry-run` reporta exactamente lo mismo sin tocar ningún archivo:

```bash
npx ng update @angular/core @angular/cli --dry-run
```

`npx` antepuesto ejecuta el `ng` **instalado en tu proyecto** (el de `node_modules/.bin`), en vez de buscar una copia global que podría ser de otra versión — así el comando corre siempre con el mismo Angular CLI que declara tu `package.json`.

**¿Por qué es importante?** Leer la checklist y correr `--dry-run` antes de aplicar cambios te deja anticipar qué requerirá trabajo manual, en vez de descubrirlo a mitad de una migración que ya modificó tu `package.json`.

La diferencia es fácil de confirmar en carne propia: corré el comando de arriba sobre un proyecto Angular real y mirá que termina sin escribir nada — la salida menciona qué haría, no reporta "installing packages". Después corré el mismo comando sin `--dry-run` sobre una copia descartable del proyecto y vas a ver `package.json` cambiar de verdad. Esa es toda la lección: `--dry-run` es la vista previa segura que siempre conviene correr primero, incluso en un proyecto de producción.

#### Ejercicio verificable 2

¿Qué flag de `ng update` simula la migración completa sin modificar ningún archivo?

Respuesta esperada: --dry-run|dry-run

### Tema 3: Por qué migrar una versión mayor a la vez

`ng update` solo prueba y soporta oficialmente saltos de una versión mayor consecutiva (de N a N+1). Saltar directamente de Angular 12 a Angular 17, por ejemplo, no tiene ruta automática confiable: las migraciones intermedias nunca se ejecutan, y el proyecto queda con una mezcla de APIs de épocas distintas.

**Analogía:** migrar versión por versión es subir una escalera peldaño por peldaño, verificando el equilibrio en cada uno; saltar varias versiones a la vez es intentar subir varios peldaños de un salto — si algo falla, es mucho más difícil saber en cuál.

Esta función codifica esa regla, con su caso límite real como frontera a proteger:

```ts
// salto-version.mjs
export function esSaltoDeUnaVersion(origen, destino) {
  if (destino <= origen) return false;
  return destino - origen === 1;
}
```

```ts
// salto-version.spec.mjs — vitest
import { describe, it, expect } from 'vitest';
import { esSaltoDeUnaVersion } from './salto-version.mjs';

describe('esSaltoDeUnaVersion', () => {
  it('16 a 17 es un salto soportado', () => {
    expect(esSaltoDeUnaVersion(16, 17)).toBe(true);
  });
  it('12 a 17 NO es un salto soportado', () => {
    expect(esSaltoDeUnaVersion(12, 17)).toBe(false);
  });
});
```

El segundo test es el que realmente importa: no confirma el camino feliz, confirma que la función RECHAZA el salto que `ng update` nunca prueba. Si cambiás `=== 1` por `<= 5` para "ser más flexible", ese test empieza a fallar — y con razón, porque esa flexibilidad no existe en la herramienta real que estás modelando.

**Errores comunes:** asumir que un rango "razonable" de versiones es tan seguro como un salto de una sola versión; planear una migración sin contar antes cuántos saltos intermedios reales requiere.

#### Ejercicio verificable 3

Según `ng update`, ¿cuántas versiones mayores de diferencia tiene el único tipo de salto soportado oficialmente?

Respuesta esperada: 1|una|uno

#### Problema resuelto 12.1

Un proyecto está en Angular 12 y necesita llegar a Angular 17. ¿Cuántos comandos `ng update` distintos hace falta correr como mínimo, y en qué orden?

**Razonamiento:** `ng update` solo prueba y soporta saltos de una versión mayor consecutiva (de N a N+1). De 12 a 17 hay cinco saltos de una versión: 12→13, 13→14, 14→15, 15→16 y 16→17. Saltarse alguno de estos —por ejemplo ir directo de 12 a 15— deja migraciones intermedias sin ejecutar, con APIs de épocas distintas mezcladas en el mismo proyecto.

**Respuesta:** Cinco comandos `ng update`, uno por cada salto de versión mayor consecutiva: 12→13, 13→14, 14→15, 15→16 y 16→17.

---

## Laboratorio práctico

Elegí una versión real de origen y destino para un proyecto Angular propio. Consultá update.angular.io para esa migración específica, leé la checklist completa, y corré `ng update --dry-run` para confirmar en tu propia terminal qué reporta antes de aplicar ningún cambio. El laboratorio queda resuelto cuando puedas explicar, con la checklist real delante, qué parte de esa migración se automatiza y qué parte vas a tener que revisar vos.

**Requisitos previos:** Módulos 0-11 completados.
