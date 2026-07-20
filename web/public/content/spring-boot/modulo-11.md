# Módulo 11: Empaquetado y despliegue


## Aprende construyendo

### Tema 1: Fat JAR vs capas de Docker

**Conceptos clave:** empaquetado por capas, reducir el tamaño de actualizaciones de imagen.

Un fat JAR (generado con `./mvnw package`, ejecutable directamente con `java -jar`) empaqueta la aplicación completa junto con todas sus dependencias en un único archivo autocontenible, simple de generar y distribuir, pero problemático como base directa de una imagen Docker: cada cambio de código, sin importar cuán pequeño sea, produce un JAR completo distinto, y si ese JAR se coloca como una única capa en un Dockerfile, Docker tendría que re-subir la imagen completa en cada deploy, incluyendo las dependencias que en realidad no cambiaron en absoluto respecto al deploy anterior.

Spring Boot soporta empaquetado por capas (`spring-boot:build-image`, o un Dockerfile estructurado explícitamente en capas separadas) que separa las dependencias del proyecto (que cambian con mucha menor frecuencia que el código propio de la aplicación) del código compilado de la propia aplicación (que cambia en prácticamente cada commit): al estructurar la imagen Docker con las dependencias en una capa separada y el código de la aplicación en otra capa distinta y posterior, Docker puede reutilizar la capa de dependencias sin cambios entre deploys sucesivos, subiendo únicamente la capa de código de la aplicación (considerablemente más pequeña) en cada nuevo deploy, en vez de tener que re-subir la imagen completa cada vez.

**Analogía:** empaquetar todo en un único fat JAR como una sola capa de Docker es como reempacar y volver a enviar una caja completa cada vez que cambia solo un pequeño objeto dentro de ella; empaquetar por capas es como separar el contenido estable (que rara vez cambia) del contenido que cambia frecuentemente en cajas distintas, reenviando solo la caja pequeña que efectivamente cambió en cada ocasión.

**¿Por qué es importante?** Empaquetar por capas separa dependencias (estables) del código de la aplicación (cambiante), reduciendo significativamente el tamaño de las actualizaciones de imagen que Docker necesita re-subir en cada deploy.

**Código del ejemplo:**

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/dependency/ ./
COPY target/classes/ ./
ENTRYPOINT ["java", "-cp", ".", "com.miapp.Main"]
```

### Tema 2: GraalVM native image

**Conceptos clave:** compilación ahead-of-time a binario nativo, arranque casi instantáneo.

`./mvnw -Pnative native:compile` compila la aplicación Spring Boot a un binario nativo ejecutable directamente por el sistema operativo, en vez de bytecode interpretado/compilado JIT por la JVM tradicional (Módulo 11 del track de Java): esta compilación ahead-of-time (realizada completamente antes de la ejecución, en vez de la compilación JIT en caliente durante la ejecución real) produce un binario con un tiempo de arranque casi instantáneo (milisegundos, en vez de los segundos típicos de arranque de una aplicación Spring Boot sobre la JVM tradicional) y un footprint de memoria considerablemente menor, a cambio de un tiempo de build significativamente más lento, y ciertas limitaciones concretas: el uso de reflexión (una técnica que muchas librerías Java, incluyendo partes de Spring, usan internamente) requiere configuración explícita adicional para que el compilador nativo pueda saber de antemano qué clases y métodos necesitan permanecer accesibles vía reflexión en el binario final, dado que el compilador ahead-of-time no puede inferir dinámicamente ese uso como sí lo haría la JVM tradicional en tiempo de ejecución.

Un arranque en milisegundos aporta un valor real y concreto específicamente para sistemas con autoscaling agresivo: en un sistema que escala horizontalmente añadiendo instancias nuevas rápidamente ante picos de tráfico repentinos, un tiempo de arranque de milisegundos permite que esas nuevas instancias estén disponibles para recibir tráfico casi instantáneamente, mientras que un tiempo de arranque de varios segundos (típico de la JVM tradicional) significa que, durante un pico de tráfico repentino, el sistema tarda proporcionalmente más tiempo en escalar efectivamente su capacidad real, potencialmente degradando la experiencia durante exactamente el período donde más se necesitaría esa capacidad adicional.

**Analogía:** GraalVM native image es como tener un vehículo que enciende instantáneamente en vez de requerir un período de calentamiento del motor antes de estar completamente operativo, particularmente valioso cuando se necesita poner en marcha vehículos adicionales rápidamente ante una demanda repentina.

**¿Por qué es importante?** Un arranque en milisegundos con GraalVM native image aporta valor concreto en sistemas con autoscaling agresivo, donde nuevas instancias deben estar disponibles casi instantáneamente ante picos de tráfico, a costa de un build más lento y limitaciones con reflexión.

**Prueba en terminal:**

```bash
./mvnw -Pnative native:compile
./target/mi-app   # arranca en milisegundos, no segundos
```

### Tema 3: Health checks para Kubernetes

**Conceptos clave:** liveness/readiness probes conectados a Actuator.

Configurar los health checks de Actuator (Módulo 7) como probes explícitos de un manifiesto de Kubernetes (`livenessProbe: { httpGet: { path: /actuator/health/liveness, port: 8080 } }`, `readinessProbe: { httpGet: { path: /actuator/health/readiness, port: 8080 } }`) conecta directamente la observabilidad interna ya construida en la aplicación (Módulo 7) con las decisiones operativas reales que Kubernetes toma sobre esa aplicación desplegada: cuándo reiniciar un pod que dejó de responder correctamente (liveness), y cuándo un pod está genuinamente en condiciones de recibir tráfico real (readiness), decisiones automatizadas y continuas que de otro modo requerirían intervención manual constante de un operador humano monitoreando el sistema.

**Analogía:** conectar los health checks de Actuator a los probes de Kubernetes es como instalar sensores automáticos que informan directamente al sistema de gestión de una flota de vehículos cuándo un vehículo específico necesita mantenimiento (reiniciarse) o cuándo simplemente no está listo para un nuevo viaje todavía (no recibir tráfico), automatizando decisiones que de otro modo requerirían inspección manual constante.

**¿Por qué es importante?** Conectar los health checks de Actuator directamente a los probes de Kubernetes automatiza decisiones operativas críticas (reiniciar, recibir tráfico) sin necesidad de intervención manual constante.

**Configuración del ejemplo:**

```yaml
livenessProbe: { httpGet: { path: /actuator/health/liveness, port: 8080 } }
readinessProbe: { httpGet: { path: /actuator/health/readiness, port: 8080 } }
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una imagen Docker de un servicio Spring Boot optimizada por capas.

**Requisitos previos:** Módulos 0-10 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Generar el fat JAR y ejecutarlo | `./mvnw package` + `java -jar` | Verifica el funcionamiento básico |
| 2 | Construir la imagen por capas | Ver Tema 1 | Compara el tamaño con un JAR simple |
| 3 | Compilar a GraalVM native image | Ver Tema 2 | Mide el tiempo de arranque |
| 4 | Configurar los health checks de Kubernetes | Ver Tema 3 | Conectados a Actuator |

**Verificación:** el laboratorio se considera exitoso si la imagen por capas reduce mensurablemente el tamaño de actualización en un segundo deploy simulado (comparado con reconstruir el JAR completo), y si el binario nativo arranca en milisegundos comparado con la JVM tradicional.

**Errores comunes y soluciones**

- **Empaquetar todo en una única capa de Docker.** Separa dependencias (estables) del código de la aplicación (cambiante).
- **Asumir que GraalVM native image no requiere ninguna configuración adicional.** Verifica que el uso de reflexión esté correctamente configurado para el compilador nativo.
- **No conectar los health checks de Actuator a los probes de Kubernetes.** Sin esa conexión, Kubernetes no puede tomar decisiones informadas sobre el estado real de la aplicación.

---
