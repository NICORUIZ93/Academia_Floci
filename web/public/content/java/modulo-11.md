## Generaciones de memoria

La heap de la JVM se divide típicamente en generación joven (objetos recién creados, recolectada frecuentemente y rápido) y generación vieja (objetos que sobrevivieron varias recolecciones, recolectada con menos frecuencia). Esta separación se basa en la observación empírica de que la mayoría de objetos mueren jóvenes.

## Recolectores: G1 vs ZGC

- **G1** (por defecto desde Java 9): buen balance entre throughput y pausas predecibles, adecuado para la mayoría de aplicaciones
- **ZGC**: pausas ultra-cortas (sub-milisegundo) incluso con heaps enormes, a cambio de algo más de overhead general — ideal para aplicaciones muy sensibles a latencia

```bash
java -XX:+UseZGC -jar mi-app.jar
```

## Java Flight Recorder (JFR)

```bash
java -XX:StartFlightRecording=filename=perfil.jfr -jar mi-app.jar
```

Graba eventos de la JVM (CPU, memoria, locks) con overhead mínimo — se puede usar de forma segura en producción para diagnosticar problemas reales sin reproducirlos en un entorno separado.

## JIT compilation

La JVM interpreta el bytecode inicialmente, pero identifica el código "caliente" (ejecutado muy frecuentemente) y lo compila a código máquina nativo optimizado en tiempo de ejecución — por eso una aplicación Java suele acelerarse después de los primeros segundos de ejecución (warm-up).

## Flags comunes

```bash
-Xmx2g          # heap máximo
-Xms2g          # heap inicial
-XX:+PrintGCDetails  # logs detallados del recolector
```
