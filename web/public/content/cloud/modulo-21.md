# Módulo 21: Proyecto integrador: API multi-nube con AWS, Azure y GCP

## Sílabo

**Objetivo general**

Construir la misma API "Gestor de Tareas" tres veces (una en AWS local, una en Azure local, una en GCP local), comparando las diferencias reales entre proveedores y demostrando que el conocimiento arquitectónico fundamental es portable, aunque las APIs y detalles operativos específicos no lo sean directamente.

**Objetivos específicos**

1. Implementar la API completa en AWS con Lambda, API Gateway, DynamoDB, SQS, S3, CloudWatch, Cognito y CloudFormation.
2. Implementar la misma API en Azure con Functions, Service Bus, Cosmos DB y Blob Storage.
3. Implementar los endpoints de solo lectura en GCP con Firestore, Cloud Storage y Pub/Sub.
4. Documentar sistemáticamente qué fue igual y qué fue diferente entre los tres proveedores.

**Contenido**

- Arquitectura multi-nube.
- Portabilidad.
- Feature parity.
- Interoperabilidad.
- CI local.
- Documentación de diferencias.
- Arquitectura interna de cloud local: GraalVM, arranque en ~24ms, "real engines, not mocks".
- cloud local en CI/CD: pruebas de integración sin coste, integración con Testcontainers.
- Migración desde LocalStack, Azurite o gcloud emulators a un único endpoint cloud local.
- Persistencia de estado entre reinicios y límites: emulador para desarrollo, no para producción.

**Evaluación**

API completa con los mismos endpoints funcionando en AWS local, Azure local y GCP local, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Arquitectura multi-nube y portabilidad de conocimiento

**Conceptos clave:** los principios arquitectónicos son transferibles, las APIs específicas no lo son.

```
AWS:   API Gateway → Lambda → DynamoDB / SQS / S3, protegido con Cognito, desplegado con CloudFormation
Azure: Functions → Cosmos DB / Service Bus / Blob Storage local
GCP:   Firestore + Cloud Storage + Pub/Sub local (solo lectura)
```

Construir la misma API "Gestor de Tareas" tres veces, una por proveedor, revela directamente qué conocimiento es genuinamente transferible entre proveedores cloud y qué es específico de cada uno: los principios arquitectónicos fundamentales estudiados a lo largo de todo el track (funciones serverless orientadas a eventos, colas para desacoplar productores y consumidores, bases de datos NoSQL para patrones de acceso simples y conocidos, almacenamiento de objetos para archivos, autenticación delegada a un servicio especializado) se aplican de forma prácticamente idéntica en los tres proveedores, mientras que la sintaxis exacta de cada API, los nombres específicos de cada servicio, y ciertos detalles operativos particulares (cómo se configuran los triggers, el formato exacto de las políticas de permisos) sí difieren considerablemente entre AWS, Azure y GCP.

Esta distinción entre "principios portables" y "sintaxis específica de proveedor" es exactamente el mismo patrón de aprendizaje observado repetidamente a lo largo de toda la Academia: UDF es el mismo principio en Android, iOS, React y Angular aunque cada uno lo exprese con herramientas distintas (StateFlow, Combine, hooks, signals); de la misma forma, "desacoplar productores de consumidores con una cola" es el mismo principio en SQS, Service Bus y Pub/Sub, aunque cada API tenga su propia sintaxis particular de configuración.

**Analogía:** construir la misma app en tres proveedores cloud es como aprender a conducir vehículos de tres fabricantes distintos: los principios fundamentales de conducción (acelerar, frenar, girar, las reglas de tránsito) son completamente transferibles entre todos ellos, mientras que la ubicación exacta de cada control específico y ciertos detalles operativos particulares de cada fabricante requieren familiarización específica con cada modelo individual.

**¿Por qué es importante?** Lo que aprendiste en AWS aplica directamente en Azure y GCP a nivel de principios arquitectónicos fundamentales (serverless, colas, NoSQL, auth delegada), mientras la sintaxis exacta de cada API y ciertos detalles operativos son fundamentalmente diferentes y requieren aprendizaje específico por proveedor.

**Diagrama:**

```
Principio: "desacoplar productor y consumidor con una cola"  → PORTABLE
Sintaxis:  aws sqs send-message vs az servicebus queue send  → ESPECÍFICO de cada proveedor
```

### Tema 2: Arquitectura interna de cloud local y su uso en CI/CD

**Conceptos clave:** motores reales, no simulaciones aproximadas; sin costo para pruebas de integración repetidas.

cloud local se distingue de simulaciones más superficiales de servicios cloud por su filosofía de "real engines, not mocks": cuando se crea una instancia RDS, corre PostgreSQL real (Módulo 13); cuando se crea un cluster ECS, corren contenedores Docker reales (Módulo 14); cuando se invoca Lambda, ejecuta el runtime real correspondiente en un contenedor Docker real, no una simulación aproximada de su comportamiento con lógica propia potencialmente divergente del comportamiento real de AWS; esta fidelidad de emulación, construida internamente sobre GraalVM (una máquina virtual que permite arranque considerablemente más rápido, en el orden de ~24 milisegundos, comparado con el arranque de una JVM tradicional) hace que cloud local sea considerablemente más confiable como entorno de pruebas que emuladores que reimplementan la lógica de cada servicio de forma aproximada y potencialmente divergente del comportamiento real.

Esta fidelidad hace que cloud local sea especialmente valioso integrado en pipelines de CI/CD: ejecutar pruebas de integración completas contra servicios cloud reales (no solo unit tests con mocks) en cada pull request, sin ningún costo asociado a crear y destruir recursos reales de AWS repetidamente, y con integración directa vía Testcontainers (una librería que gestiona el ciclo de vida de contenedores Docker específicamente para pruebas automatizadas, arrancando y destruyendo cloud local automáticamente alrededor de cada suite de pruebas de integración).

**Analogía:** cloud local es como un simulador de vuelo que usa los mismos sistemas de aviónica reales que un avión genuino, en vez de una recreación aproximada con lógica simplificada propia; usarlo en CI/CD es como poder entrenar con ese simulador de alta fidelidad tantas veces como sea necesario sin el costo ni el riesgo de usar un avión real para cada sesión de entrenamiento repetida.

**¿Por qué es importante?** cloud local usa motores reales (PostgreSQL real, Docker real, runtimes reales) en vez de simulaciones aproximadas, ofreciendo pruebas de integración de alta fidelidad sin costo en CI/CD, integrado con Testcontainers para gestionar automáticamente su ciclo de vida alrededor de cada suite de pruebas.

**Diagrama:**

```
RDS (cloud local)  → PostgreSQL REAL corriendo
ECS (cloud local)  → contenedores Docker REALES
Lambda (cloud local) → runtime REAL en contenedor Docker
= "real engines, not mocks"
```

### Tema 3: Migración desde otros emuladores, y límites de un emulador

**Conceptos clave:** un único endpoint unificado multi-servicio, apropiado para desarrollo, no para producción.

Migrar desde LocalStack (el emulador de AWS más establecido históricamente), Azurite (el emulador oficial de Azure Storage), o los emuladores individuales de gcloud hacia un único endpoint de cloud local que emula los tres proveedores simplifica la configuración de un entorno de desarrollo que necesita trabajar con múltiples servicios cloud simultáneamente (por ejemplo, el proyecto multi-nube de este mismo módulo), evitando gestionar tres herramientas de emulación completamente separadas con configuraciones, puertos y comportamientos potencialmente inconsistentes entre sí.

Un límite importante que debe reconocerse explícitamente: cloud local (como cualquier emulador, sin importar su fidelidad) es una herramienta diseñada para desarrollo y pruebas, no un sustituto completo de una prueba final contra la nube real antes de un despliegue a producción; aspectos como límites reales de cuota, latencia de red genuina entre regiones geográficas reales, comportamiento bajo carga a escala de producción real, y ciertas particularidades de servicios gestionados completamente específicas de la infraestructura real de cada proveedor (no replicables ni siquiera por un emulador de alta fidelidad) requieren necesariamente una validación final contra el entorno real antes de considerar cualquier sistema listo para producción. Igualmente, la persistencia de estado entre reinicios de cloud local (para servicios como ECS, CodeBuild, Config) tiene límites específicos documentados que conviene conocer antes de depender de esa persistencia para flujos de trabajo críticos de desarrollo.

**Analogía:** cloud local es como un excelente campo de entrenamiento con equipo real y de alta fidelidad para practicar procedimientos, pero ninguna cantidad de entrenamiento en ese campo sustituye completamente la validación final en las condiciones reales y variables del entorno de producción genuino, con todas sus particularidades y escala que ningún entorno de práctica, por fiel que sea, puede replicar completamente.

**¿Por qué es importante?** Un único endpoint de cloud local simplifica trabajar con múltiples proveedores simultáneamente frente a gestionar herramientas de emulación separadas; sin embargo, ninguna prueba local, sin importar su fidelidad, sustituye una prueba final contra la nube real antes de producción, dado que aspectos como escala, latencia real y cuotas no son replicables completamente por un emulador.

**Diagrama:**

```
LocalStack + Azurite + gcloud emulators (3 herramientas separadas)
        ↓ migración
cloud local (1 único endpoint, AWS + Azure + GCP)

Pero: cloud local = desarrollo/pruebas, SIEMPRE requiere validación final contra la nube real antes de producción
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una API completa con los mismos endpoints funcionando en AWS local, Azure local y GCP local.

**Requisitos previos:** Módulos 0-20 completados.

| Paso | Acción | Explicación |
|---|---|---|
| 1 | AWS: implementar GET/POST /tareas con Lambda + API Gateway + DynamoDB + SQS + S3 + CloudWatch | Stack completo estudiado en el track |
| 2 | AWS: agregar autenticación con Cognito y desplegar con CloudFormation | Módulos 15 y 18 |
| 3 | Azure: implementar la misma API con Functions + Service Bus + Cosmos DB + Blob Storage local | Comparar sintaxis |
| 4 | GCP: implementar endpoints de solo lectura con Firestore + Cloud Storage + Pub/Sub local | Comparar sintaxis |
| 5 | Escribir pruebas de integración contra los tres emuladores, y documentar en una tabla qué fue igual y qué fue diferente | Portabilidad de conocimiento |

**Verificación:** el proyecto se considera exitoso si la misma funcionalidad de "Gestor de Tareas" opera correctamente en los tres proveedores locales, si las pruebas de integración pasan contra los tres, y si la tabla comparativa identifica correctamente los principios compartidos frente a las diferencias específicas de sintaxis y API de cada proveedor.

**Errores comunes y soluciones**

- **Asumir que la sintaxis de la API es igual entre proveedores solo porque el principio arquitectónico es el mismo.** Documenta explícitamente las diferencias de sintaxis específicas de cada uno.
- **Depender únicamente de pruebas contra cloud local sin ninguna validación final contra la nube real antes de producción.** Reconoce los límites de fidelidad de cualquier emulador.
- **Gestionar LocalStack, Azurite y emuladores de gcloud por separado en vez de un único endpoint unificado.** Simplifica la configuración con cloud local para proyectos multi-nube.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué es transferible entre proveedores

**Enunciado:** ¿qué aprendiste en AWS que aplica directamente en Azure y GCP?

**Solución esperada:** los principios arquitectónicos fundamentales (serverless orientado a eventos, colas para desacoplar productores y consumidores, NoSQL para patrones de acceso simples y conocidos, almacenamiento de objetos, autenticación delegada a un servicio especializado) se aplican de forma prácticamente idéntica en los tres proveedores, aunque la sintaxis exacta de cada API sea distinta.

**Criterios de éxito:**
- Identifica correctamente al menos dos principios arquitectónicos transferibles entre los tres proveedores.

### Ejercicio 2: Qué fue fundamentalmente diferente entre los proveedores

**Enunciado:** ¿qué fue fundamentalmente diferente entre los 3 proveedores?

**Solución esperada:** una respuesta válida identifica diferencias concretas de sintaxis de API, nomenclatura de servicios equivalentes (SQS vs Service Bus vs Pub/Sub), y detalles operativos particulares (formato de políticas de permisos, configuración de triggers) que requieren aprendizaje específico por proveedor, no transferible directamente entre ellos.

**Criterios de éxito:**
- Identifica correctamente diferencias concretas de sintaxis/API como lo fundamentalmente distinto entre proveedores.

### Ejercicio 3: Qué falta para pasar a producción en nube real

**Enunciado:** ¿qué quedaría pendiente para pasar a producción en nube real?

**Solución esperada:** una prueba final de validación contra el entorno real de cada proveedor, dado que aspectos como límites reales de cuota, latencia de red genuina entre regiones reales, comportamiento bajo carga a escala de producción real, y particularidades específicas de servicios gestionados no son completamente replicables ni siquiera por un emulador de alta fidelidad como cloud local.

**Criterios de éxito:**
- Menciona correctamente la validación final contra el entorno real como el paso pendiente, con al menos una razón concreta de por qué el emulador no es suficiente por sí solo.

---

## Resumen del módulo

**Puntos clave**

- Los principios arquitectónicos fundamentales son portables entre AWS, Azure y GCP; la sintaxis exacta de cada API es específica de cada proveedor.
- cloud local usa motores reales (PostgreSQL real, Docker real, runtimes reales) en vez de simulaciones aproximadas, con alta fidelidad para CI/CD.
- Un único endpoint de cloud local simplifica proyectos multi-nube frente a gestionar LocalStack, Azurite y emuladores de gcloud por separado.
- Ningún emulador, sin importar su fidelidad, sustituye completamente una prueba final contra la nube real antes de producción.

**Conceptos aprendidos**

- Arquitectura multi-nube.
- Portabilidad.
- Feature parity.
- Interoperabilidad.
- CI local con Testcontainers.
- Arquitectura interna de cloud local (GraalVM).
- Límites de un emulador para producción.

**Próximos pasos**

Con el track de Cloud completo (módulos 0-21), los mismos principios arquitectónicos aprendidos aquí —serverless, colas y streams, bases de datos gestionadas, IaC, autenticación delegada, observabilidad— reaparecerán en cualquier proyecto real de backend que construyas, independientemente del proveedor cloud específico que uses en producción.

**Recursos adicionales**

- Documentación de cloud local y comparativa multi-proveedor (consulta la tabla `CLOUD_COMPARISON` de la app para referencia rápida de servicios equivalentes).
