# Módulo 12: Apéndice: qué cambió entre versiones mayores


## Aprende construyendo

Angular no llegó a su forma actual de un solo salto. Tres quiebres reales explican por qué código de épocas distintas puede lucir tan diferente entre sí, y terminan en una regla práctica: por qué `ng update` solo garantiza migraciones de una versión mayor a la vez.

### Tema 1: Los saltos que importan

El primero no fue una actualización: en 2016, Angular 2 reemplazó por completo a AngularJS (la versión 1.x, basada en controllers y `$scope`), sin compatibilidad hacia atrás. Los conceptos, la sintaxis y la arquitectura cambiaron enteros — por eso hoy se tratan como dos proyectos distintos, con AngularJS retirado y Angular como el sucesor activo.

Los saltos posteriores sí fueron incrementales, pero dos de ellos cambiaron cómo se escribe código Angular todos los días. Angular 9 (2020) adoptó Ivy como motor de renderizado por defecto, con bundles más chicos y errores más claros, sin que la mayoría de proyectos tuviera que tocar código. Angular 14 (2022) introdujo standalone components (Módulo 0) en preview; Angular 16-17 (2023) estabilizó Signals (Módulo 2) y volvió standalone el comportamiento por defecto del CLI, consolidando ambos como el enfoque recomendado — no una alternativa experimental.

**Analogía:** el salto de AngularJS a Angular es como mudarse a otra ciudad; Ivy, standalone y Signals son renovaciones sucesivas de esa misma ciudad nueva.

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

### Tema 2: Cómo leer un Angular Update Guide

Antes de migrar, [update.angular.io](https://update.angular.io) genera una checklist específica para el salto exacto que estás por dar (por ejemplo, de Angular 16 a 17): qué APIs cambiaron, qué automatiza `ng update`, y qué queda para revisión manual porque no puede resolverse sin criterio humano.

El comando real que aplica esas migraciones es `ng update @angular/core@18 @angular/cli@18`. Antes de correrlo, `--dry-run` reporta exactamente lo mismo sin tocar ningún archivo:

```bash
npx ng update @angular/core @angular/cli --dry-run
```

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

---

## Laboratorio práctico

Elegí una versión real de origen y destino para un proyecto Angular propio. Consultá update.angular.io para esa migración específica, leé la checklist completa, y corré `ng update --dry-run` para confirmar en tu propia terminal qué reporta antes de aplicar ningún cambio. El laboratorio queda resuelto cuando puedas explicar, con la checklist real delante, qué parte de esa migración se automatiza y qué parte vas a tener que revisar vos.

**Requisitos previos:** Módulos 0-11 completados.
