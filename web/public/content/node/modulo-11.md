# Módulo 11: Despliegue y contenedores

## Sílabo

**Objetivo general**

Empaquetar y desplegar una API Node de forma reproducible usando Docker multi-stage, conectando directamente con las prácticas del track DevOps, y entender las alternativas de despliegue disponibles según el contexto.

**Objetivos específicos**

1. Escribir un Dockerfile multi-stage optimizado para una aplicación Node.
2. Configurar variables de entorno diferenciadas por ambiente.
3. Configurar un healthcheck a nivel de Docker.
4. Explicar qué se necesita para lograr un despliegue sin downtime.
5. Comparar PM2, contenedores y plataformas serverless para gestión de procesos Node.

**Contenido**

- Dockerfile para Node (multi-stage).
- Variables de entorno por ambiente.
- PM2 frente a contenedores para gestión de procesos.
- Zero-downtime deploys.
- Nginx como reverse proxy y balanceador.
- Serverless: AWS Lambda, Vercel y Azure Functions.

**Evaluación**

Una imagen Docker de producción de la API, optimizada y sin dependencias de desarrollo, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Dockerfile multi-stage para Node

**Conceptos clave:** etapa de build frente a etapa final, exclusión de devDependencies.

Un Dockerfile multi-stage (concepto introducido en profundidad en el Módulo 2 del track DevOps) separa el proceso de construcción de una imagen en etapas distintas, cada una con su propio propósito: una etapa de "build" instala todas las dependencias (incluyendo `devDependencies` necesarias para compilar TypeScript o ejecutar un bundler), copia el código fuente completo, y ejecuta el proceso de compilación; una etapa final, considerablemente más ligera, copia únicamente el resultado ya compilado de la etapa de build (`COPY --from=build /app/dist ./dist`) e instala solo las dependencias de producción (`npm ci --omit=dev`, aprovechando la distinción entre `dependencies` y `devDependencies` estudiada en el Módulo 1), sin incluir nunca en la imagen final el código fuente sin compilar, las herramientas de build, ni ninguna dependencia exclusiva de desarrollo.

Esta separación produce una imagen final considerablemente más pequeña y con una superficie de ataque reducida (menos paquetes instalados significa menos vulnerabilidades potenciales de terceros presentes en la imagen final), además de un tiempo de despliegue más rápido (una imagen más pequeña se transfiere y arranca más rápido) comparado con una imagen de una sola etapa que incluyera indiscriminadamente todo lo necesario para desarrollo y construcción además de lo necesario para ejecutar en producción. Comparar el tamaño final de ambas versiones (multi-stage optimizada frente a una versión ingenua de una sola etapa) hace tangible el beneficio concreto de esta técnica, frecuentemente revelando una diferencia de varias veces en el tamaño final de la imagen.

Usar una imagen base ligera como `node:22-alpine` (basada en Alpine Linux, una distribución minimalista, en vez de una distribución completa como Debian o Ubuntu) para ambas etapas reduce aún más el tamaño base de la imagen, aunque requiere verificar que todas las dependencias del proyecto (incluyendo cualquier dependencia nativa que requiera compilación específica del sistema operativo) sean compatibles con el entorno de Alpine, que usa una biblioteca C distinta (musl en vez de glibc) que ocasionalmente causa incompatibilidades sutiles con paquetes que dependen de binarios nativos precompilados específicamente para glibc.

**Analogía:** un Dockerfile multi-stage es como un taller de manufactura con dos zonas separadas: una zona de fabricación completa con todas las herramientas pesadas necesarias para construir el producto (la etapa de build), y una zona de empaquetado final que solo recibe el producto ya terminado, sin ninguna de las herramientas de fabricación pesadas presentes en el empaque final que se envía al cliente.

**¿Por qué es importante?** Un Dockerfile multi-stage produce imágenes de producción considerablemente más pequeñas y con menor superficie de ataque, excluyendo herramientas de build y dependencias de desarrollo que no tienen ninguna razón de estar presentes en el entorno de ejecución final.

**Diagrama:**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

### Tema 2: Variables de entorno por ambiente y healthchecks

**Conceptos clave:** configuración externalizada, misma imagen en todos los entornos, `HEALTHCHECK`.

Un principio fundamental de despliegue reproducible (conectado directamente con la práctica de configuración externalizada estudiada en el Módulo 12 del track DevOps) es que la imagen de contenedor debe ser idéntica en todos los entornos (desarrollo, staging, producción); lo único que debería cambiar entre entornos son las variables de entorno inyectadas al arrancar el contenedor (`DATABASE_URL`, `LOG_LEVEL`, entre otras), nunca el código o la configuración hardcodeada dentro de la imagen misma. Mantener archivos `.env` separados por ambiente (`.env.production`, `.env.development`) como referencia de qué variables se necesitan, sin que ninguno de esos archivos con valores sensibles reales se incluya dentro de la imagen de Docker construida, es la práctica correcta.

Un `HEALTHCHECK` declarado directamente en el Dockerfile (`HEALTHCHECK CMD node -e "..."`) permite que Docker (y, por extensión, un orquestador como Kubernetes) verifique periódicamente si el contenedor está genuinamente saludable, no solo si el proceso sigue técnicamente en ejecución: un proceso Node puede seguir corriendo técnicamente mientras está en un estado interno defectuoso (por ejemplo, incapaz de conectarse a su base de datos), y un healthcheck a nivel de aplicación (invocando el endpoint `/health` construido en el Módulo 9, que verifica activamente la conexión a la base de datos antes de responder) detecta esta categoría de fallo que un simple "¿el proceso sigue vivo?" no capturaría.

Este healthcheck es lo que permite a un orquestador tomar decisiones automatizadas informadas: rechazar dirigir tráfico hacia un contenedor que aún no pasó su healthcheck inicial (durante el arranque), o reiniciar automáticamente un contenedor que pasó de saludable a no saludable durante su operación normal, sin depender de que un humano detecte y responda manualmente a ese estado degradado, cerrando el círculo con el Tema 4 (zero-downtime deploys), donde el healthcheck es precisamente el mecanismo que determina cuándo una nueva instancia está lista para recibir tráfico real durante un despliegue rolling.

**Analogía:** externalizar la configuración por variables de entorno es como construir un mismo producto estandarizado que se adapta a distintos mercados simplemente cambiando su empaque de etiquetado externo, sin modificar nunca el producto interno mismo. Un healthcheck es como un chequeo médico rutinario periódico que verifica la salud real del paciente (no solo que "sigue respirando"), permitiendo intervenir proactivamente ante señales tempranas de un problema antes de que se convierta en una falla completa y visible.

**¿Por qué es importante?** Externalizar la configuración garantiza que la misma imagen probada se despliega idénticamente en todos los entornos; un healthcheck a nivel de aplicación permite que el orquestador detecte y responda automáticamente a fallos internos que un simple chequeo de "el proceso sigue vivo" no capturaría.

**Diagrama:**

```dockerfile
HEALTHCHECK CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1))"
```
```bash
# .env.production          # .env.development
DATABASE_URL=prod-host      DATABASE_URL=localhost
LOG_LEVEL=info               LOG_LEVEL=debug
```

### Tema 3: PM2, contenedores y zero-downtime deploys

**Conceptos clave:** responsabilidades desplazadas al orquestador, rolling update.

Como se discutió brevemente en el Módulo 8, PM2 gestionaba tradicionalmente responsabilidades como reinicio automático ante fallos, logs centralizados y clustering directamente sobre un servidor sin contenedores; en un mundo con Docker y Kubernetes, estas responsabilidades se desplazan naturalmente hacia el orquestador: `restart: always` (o la política de reinicio equivalente en Kubernetes) reemplaza el reinicio automático de PM2; la recolección de logs de contenedores mediante el pipeline de logging del propio orquestador (Módulo 10 del track DevOps) reemplaza la gestión de logs de PM2; y el escalado horizontal mediante múltiples réplicas de Kubernetes reemplaza el clustering integrado de PM2 dentro de un único servidor.

Un despliegue sin downtime (zero-downtime deploy) requiere, como mínimo, dos condiciones: al menos dos instancias de la aplicación ejecutándose detrás de un balanceador de carga (para que retirar temporalmente una instancia durante su actualización no deje al servicio completamente sin capacidad de atender tráfico), y un healthcheck confiable (Tema 2) que el balanceador o el orquestador consulte antes de dirigir tráfico real hacia una instancia recién actualizada, garantizando que solo reciba tráfico una vez que genuinamente está lista para procesarlo correctamente, no simplemente porque el proceso ya arrancó técnicamente.

El patrón de rolling update (ya estudiado en profundidad en el Módulo 5 del track DevOps) actualiza las instancias de una en una (o en pequeños lotes), esperando a que cada nueva instancia pase su healthcheck antes de retirar tráfico de la instancia anterior correspondiente y proceder con la siguiente, de modo que en todo momento durante el despliegue completo existe al menos una instancia sana atendiendo tráfico real, sin que los usuarios experimenten ninguna interrupción perceptible del servicio durante lo que, de otro modo, sería una operación potencialmente disruptiva.

**Analogía:** un rolling update es como renovar el personal de un mostrador de atención al cliente que nunca cierra completamente: se reemplaza a un empleado a la vez, asegurándose de que el reemplazo ya está capacitado y listo (pasó el healthcheck) antes de que el empleado anterior se retire, de modo que el mostrador nunca queda completamente sin nadie atendiendo durante toda la transición.

**¿Por qué es importante?** Entender qué responsabilidades de PM2 asume ahora un orquestador de contenedores, y qué condiciones mínimas (múltiples instancias, healthcheck confiable) hacen posible un despliegue sin downtime real, son conocimientos operativos esenciales para desplegar aplicaciones Node de forma profesional en producción moderna.

**Diagrama:**

```
Rolling update con 2+ instancias detrás de un balanceador:
Instancia A (v1) ── activa ──┐
Instancia B (v1) ── activa ──┼── balanceador dirige tráfico
       │
   actualizar A → v2, esperar healthcheck OK → A recibe tráfico de nuevo
   actualizar B → v2, esperar healthcheck OK → B recibe tráfico de nuevo
   (en TODO momento, al menos una instancia sana atendiendo)
```

### Tema 4: Nginx como reverse proxy y serverless

**Conceptos clave:** reverse proxy, balanceo de carga con Nginx, funciones serverless.

Nginx, frecuentemente posicionado delante de una o más instancias de una aplicación Node, actúa como reverse proxy: recibe todo el tráfico entrante del exterior y lo reenvía hacia la instancia (o instancias) apropiadas de la aplicación, permitiendo centralizar responsabilidades como terminación TLS/HTTPS (Nginx maneja los certificados y la comunicación cifrada con el cliente externo, comunicándose con las instancias internas de Node mediante HTTP simple dentro de una red interna confiable), balanceo de carga entre múltiples instancias, y servir contenido estático directamente sin involucrar en absoluto al proceso Node para esos casos, liberando a la aplicación Node para concentrarse exclusivamente en su lógica de negocio dinámica.

Las plataformas serverless (AWS Lambda, Vercel, Azure Functions) representan un modelo de despliegue alternativo donde no se gestiona ningún servidor ni contenedor de larga duración en absoluto: el código Node se empaqueta como una función que la plataforma ejecuta bajo demanda ante cada petición entrante, escalando automáticamente el número de instancias concurrentes según la demanda real (incluyendo escalar hasta cero cuando no hay tráfico, sin costo alguno durante esos períodos de inactividad), a cambio de ciertas limitaciones como un tiempo máximo de ejecución por invocación y "cold starts" (latencia adicional en la primera invocación tras un período de inactividad, mientras la plataforma inicializa una nueva instancia de la función).

Elegir entre contenedores gestionados manualmente (o mediante Kubernetes), y una plataforma serverless, depende de las características de la carga de trabajo: aplicaciones con tráfico sostenido y predecible frecuentemente se benefician del control y el coste más predecible de instancias de contenedores de larga duración; aplicaciones con tráfico esporádico o altamente variable (con picos ocasionales y períodos largos de inactividad) frecuentemente se benefician del modelo de pago exclusivamente por uso real y el escalado automático a cero de las plataformas serverless, sin necesidad de aprovisionar ni pagar por capacidad de servidor que permanece ociosa la mayor parte del tiempo.

**Analogía:** Nginx como reverse proxy es como un recepcionista único en la entrada de un edificio con múltiples oficinas internas, dirigiendo cada visitante hacia la oficina correcta y gestionando la seguridad de acceso centralizadamente en la entrada, sin que cada oficina interna necesite gestionar su propia seguridad de entrada por separado. Serverless es como alquilar espacio de oficina exactamente por hora de uso real, sin ningún compromiso de alquiler fijo, escalando automáticamente el espacio alquilado según cuántas personas necesitan usarlo en cada momento específico, sin pagar nada durante los períodos en que nadie lo necesita.

**¿Por qué es importante?** Nginx centraliza responsabilidades transversales (TLS, balanceo, contenido estático) delante de instancias de aplicación; serverless ofrece un modelo alternativo de escalado automático y pago por uso real, apropiado específicamente para cargas de trabajo esporádicas o altamente variables, distinto del modelo de contenedores de larga duración.

**Diagrama:**

```
Cliente ──HTTPS──▶ Nginx (TLS, balanceo) ──HTTP interno──▶ Instancia Node A
                                          └──HTTP interno──▶ Instancia Node B

Serverless: código empaquetado → la plataforma lo ejecuta bajo demanda,
            escala automáticamente (incluso a cero), pago solo por uso real
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una imagen Docker de producción multi-stage optimizada de la API completa, con healthcheck y configuración externalizada por ambiente.

**Requisitos previos:** Docker instalado, Módulos 0-10 completados.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Escribir el Dockerfile multi-stage | Ver Tema 1 | Etapa de build + etapa final solo con producción |
| 2 | Comparar tamaños de imagen | Multi-stage vs una sola etapa sin optimizar | Documenta la diferencia real observada |
| 3 | Configurar variables de entorno por ambiente | `.env.production` / `.env.development` | Verifica que la misma imagen se comporta distinto según las variables inyectadas |
| 4 | Levantar el contenedor y verificar logs | `docker run`, `docker logs` | Confirma arranque correcto |
| 5 | Configurar el HEALTHCHECK | Ver Tema 2 | Verifica con `docker inspect` que Docker reporta el estado de salud |
| 6 | Documentar un despliegue sin downtime | Al menos 2 instancias tras un balanceador | Describe el proceso de rolling update completo |

**Verificación:** el laboratorio se considera exitoso si la imagen multi-stage es sustancialmente más pequeña que la versión de una sola etapa, y si `docker inspect` reporta correctamente el estado de salud del contenedor según el healthcheck configurado.

**Errores comunes y soluciones**

- **Incluir el código fuente sin compilar y las devDependencies en la imagen final.** Usa multi-stage, copiando solo el resultado ya compilado y las dependencias de producción a la etapa final.
- **Hardcodear configuración específica de un ambiente dentro de la imagen.** Externaliza toda la configuración que varía entre ambientes mediante variables de entorno inyectadas al arrancar el contenedor.
- **Desplegar una actualización sin verificar el healthcheck antes de retirar tráfico de la instancia anterior.** Esto puede causar downtime real si la nueva instancia no está genuinamente lista; siempre espera el healthcheck confirmado antes de continuar el rolling update.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué multi-stage es más seguro y liviano

**Enunciado:** explica por qué una imagen Docker multi-stage es más segura y liviana que una de una sola etapa, con al menos dos razones concretas.

**Solución esperada:** (1) es más liviana porque excluye el código fuente sin compilar, las herramientas de build y las devDependencies, incluyendo solo el resultado compilado y las dependencias estrictamente de producción; (2) es más segura porque menos paquetes instalados en la imagen final significa menos superficie de vulnerabilidades potenciales de terceros presentes en el entorno de ejecución real.

**Criterios de éxito:**
- Menciona correctamente la reducción de tamaño (exclusión de devDependencies y build tools).
- Menciona correctamente la reducción de superficie de ataque como razón de seguridad.

### Ejercicio 2: Ventaja de un healthcheck a nivel de Docker/Kubernetes

**Enunciado:** explica qué ventaja concreta da un healthcheck frente a simplemente verificar que el proceso Node sigue en ejecución.

**Solución esperada:** un proceso puede seguir técnicamente en ejecución mientras está en un estado interno defectuoso (por ejemplo, sin poder conectarse a su base de datos), algo que un simple chequeo de "¿el proceso sigue vivo?" no detectaría; un healthcheck a nivel de aplicación (verificando activamente dependencias críticas como la conexión a base de datos) captura esta categoría de fallo, permitiendo que el orquestador reaccione (reiniciando o evitando dirigir tráfico) ante un estado genuinamente no saludable, no solo ante un proceso completamente caído.

**Criterios de éxito:**
- Explica correctamente la diferencia entre "proceso vivo" y "aplicación genuinamente saludable".

### Ejercicio 3: Condiciones para zero-downtime

**Enunciado:** enumera las condiciones mínimas necesarias para lograr un despliegue sin downtime.

**Solución esperada:** al menos dos instancias de la aplicación ejecutándose simultáneamente detrás de un balanceador de carga, y un healthcheck confiable que el balanceador u orquestador consulte antes de dirigir tráfico real hacia una instancia recién actualizada, actualizando las instancias de una en una (rolling update) para que siempre exista al menos una instancia sana atendiendo tráfico durante todo el proceso de despliegue.

**Criterios de éxito:**
- Menciona correctamente las dos condiciones mínimas: múltiples instancias y healthcheck confiable.
- Menciona el patrón de actualización gradual (rolling update) como el mecanismo que las combina.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- OpenJS Foundation, *Node.js Documentation*.
- IETF, especificaciones HTTP Semantics, OAuth 2.0 y JSON.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Un Dockerfile multi-stage separa la construcción (con devDependencies y herramientas de build) de la etapa final de producción, ligera y con menor superficie de ataque.
- La configuración debe externalizarse por variables de entorno, manteniendo la misma imagen idéntica en todos los ambientes.
- Un `HEALTHCHECK` a nivel de aplicación detecta fallos internos que un simple chequeo de "proceso vivo" no captura.
- Un despliegue sin downtime requiere múltiples instancias y un healthcheck confiable, combinados en un rolling update.
- Nginx centraliza TLS y balanceo delante de instancias de aplicación; serverless ofrece un modelo alternativo de escalado automático y pago por uso real.

**Conceptos aprendidos**

- Dockerfiles multi-stage optimizados para Node.
- Configuración externalizada por ambiente y healthchecks a nivel de Docker.
- El desplazamiento de responsabilidades de PM2 hacia un orquestador de contenedores.
- Condiciones para zero-downtime deploys.
- Nginx como reverse proxy y el panorama de plataformas serverless.

**Próximos pasos**

En el Módulo 12, el proyecto final de este track, unirás todo lo aprendido en una API productiva completa: arquitectura por capas, autenticación, persistencia, testing y un contenedor listo para desplegar.

**Recursos adicionales**

- Documentación oficial de Docker: "Multi-stage builds".
- Documentación oficial de Nginx como reverse proxy.
- Documentación de AWS Lambda, Vercel Functions y Azure Functions para el panorama serverless.
