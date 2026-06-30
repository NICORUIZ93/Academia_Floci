## Los saltos que importan

| Versión | Qué cambió |
|---|---|
| AngularJS → Angular 2 (2016) | Reescritura completa del framework, sin compatibilidad hacia atrás |
| Angular 9 (2020) | Motor de renderizado **Ivy** por defecto: bundles más pequeños, mejores mensajes de error |
| Angular 14 (2022) | Standalone components como preview |
| Angular 16-17 (2023) | **Signals** como API estable, standalone como default del CLI |
| Angular 17+ | Control de flujo nativo (@if/@for), @defer, SSR de primera clase |

## Cómo leer un Angular Update Guide

[update.angular.io](https://update.angular.io) genera una checklist específica entre dos versiones: qué cambia, qué se vuelve deprecado, y comandos automáticos (`ng update`) disponibles para cada paso.

```bash
ng update @angular/core@18 @angular/cli@18
```

## Por qué migrar una versión mayor a la vez

Angular publica `ng update` con migraciones automáticas (codemods) diseñadas para saltos de UNA versión mayor. Saltar de Angular 10 a Angular 17 directamente no tiene una ruta de migración automática confiable — hay que pasar por cada versión intermedia, ejecutando y verificando la app en cada paso.
