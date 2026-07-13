# Módulo 12: Proyecto integrador — API productiva

## Sílabo

**Objetivo general**

Unir todo lo aprendido en este track en una API lista para producción real: arquitectura por capas, autenticación, persistencia, testing y observabilidad, empaquetada en un contenedor listo para desplegar.

**Objetivos específicos**

1. Diseñar una arquitectura por capas (rutas → controladores → servicios → repositorio) sin mezclar responsabilidades.
2. Integrar autenticación JWT completa con persistencia real en base de datos.
3. Escribir tests de integración que cubran el flujo crítico de principio a fin.
4. Añadir logging estructurado con correlation ID y un endpoint de health.
5. Construir el Dockerfile de producción y documentar el plan de despliegue.

**Contenido**

- Arquitectura por capas.
- Autenticación, persistencia y testing integrados.
- Observabilidad básica.
- Contenedor listo para desplegar.
- Qué sigue: microservicios, message queues (Kafka/RabbitMQ) y TypeScript con ts-node/tsx.

**Evaluación**

Una API REST con autenticación, base de datos real, tests de integración y Dockerfile de producción, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Arquitectura por capas

**Conceptos clave:** separación de responsabilidades, rutas, controladores, servicios, repositorio.

Una arquitectura por capas organiza el código de una API en niveles con responsabilidades claramente delimitadas y sin superposición: las rutas (estudiadas en el Módulo 4) definen únicamente los endpoints HTTP y delegan inmediatamente hacia los controladores, sin contener ninguna lógica de negocio propia; los controladores traducen entre el mundo HTTP (extraer parámetros de la petición, formatear la respuesta) y el mundo de la lógica de negocio, invocando a los servicios correspondientes; los servicios contienen la lógica de negocio real (reglas de validación de dominio, cálculos, orquestación de múltiples operaciones), completamente ajenos a los detalles de HTTP o de la base de datos específica usada; y el repositorio encapsula el acceso a los datos (usando Prisma, estudiado en el Módulo 5, o cualquier otro mecanismo de persistencia), sin contener ninguna lógica de negocio propia más allá de las operaciones de acceso a datos mismas.

Esta separación no es un formalismo académico sin beneficio práctico: permite testear la lógica de negocio (la capa de servicios) de forma completamente aislada, sin necesidad de levantar un servidor HTTP real ni una base de datos real (usando un repositorio simulado, un mock o un fake, en el sentido estudiado en el Módulo 9 del track de JavaScript), acelerando considerablemente la ejecución de esa categoría específica de pruebas. También permite cambiar la base de datos subyacente (migrar de PostgreSQL a otro motor, por ejemplo) modificando únicamente la capa de repositorio, sin tocar en absoluto la lógica de negocio de los servicios ni las rutas HTTP, que permanecen completamente ajenas a ese detalle de implementación específico.

Un ejemplo concreto de servicio bien diseñado (`crearTarea(repo, datos)`) recibe el repositorio como parámetro (en vez de importarlo directamente y acoplarse a una implementación específica), valida la regla de negocio relevante (`if (!datos.titulo?.trim()) throw new Error(...)`), y delega la persistencia real al repositorio recibido, ilustrando cómo cada capa mantiene su responsabilidad estrictamente delimitada: el servicio decide qué reglas de negocio aplican, sin saber ni preocuparse por los detalles de cómo el repositorio efectivamente almacena los datos.

**Analogía:** una arquitectura por capas es como una empresa con departamentos claramente delimitados: recepción (rutas) recibe visitantes y los dirige; atención al cliente (controladores) traduce sus solicitudes a un formato interno procesable; el departamento técnico (servicios) aplica las políticas y reglas de negocio reales de la empresa; y el archivo central (repositorio) gestiona el almacenamiento físico real de los documentos, sin que ningún departamento necesite entender ni interferir con el trabajo interno específico de los demás.

**¿Por qué es importante?** La arquitectura por capas permite testear la lógica de negocio de forma aislada y rápida, y cambiar detalles de implementación (como la base de datos) sin afectar el resto del sistema, dos beneficios concretos que compensan ampliamente la disciplina adicional de mantener las capas separadas consistentemente.

**Diagrama:**

```
rutas/          → define endpoints HTTP, delega a controladores
controladores/  → traduce request/response, llama a servicios
servicios/      → lógica de negocio, sin saber nada de HTTP
repositorios/   → acceso a datos (Prisma/SQL), sin lógica de negocio
```

### Tema 2: Uniendo cada módulo del track

**Conceptos clave:** integración horizontal de todo el track en un único proyecto coherente.

Este proyecto integrador conecta explícitamente cada módulo anterior del track en un flujo coherente y funcional: Express con middleware (Módulo 4) constituye la capa HTTP de rutas y controladores; Prisma con transacciones (Módulo 5) constituye la capa de persistencia, incluyendo al menos una relación uno-a-muchos entre entidades (por ejemplo, un usuario con múltiples tareas); JWT con access y refresh tokens (Módulo 6) protege las rutas que lo requieren, integrado con la base de datos real para verificar credenciales; Supertest combinado con Testcontainers (Módulo 7) prueba el flujo completo de principio a fin contra una base de datos real y efímera, no solo funciones aisladas; Pino con correlation ID (Módulo 9) proporciona observabilidad estructurada; y el Dockerfile multi-stage (Módulo 11) empaqueta todo el resultado en una imagen de producción optimizada y lista para desplegar.

Diseñar deliberadamente las conexiones entre estas piezas —no simplemente yuxtaponerlas, sino asegurarse de que realmente colaboran coherentemente como un sistema integrado— es lo que distingue este proyecto de una simple colección de ejercicios aislados de cada módulo: el middleware de autenticación del Módulo 6 debe integrarse correctamente con el router del Módulo 4; los tests de integración del Módulo 7 deben verificar genuinamente el flujo completo, incluyendo la capa de persistencia real del Módulo 5, no solo mockear cada pieza de forma aislada, que daría una falsa sensación de cobertura sin verificar realmente que las piezas colaboran correctamente entre sí.

Tomar decisiones de arquitectura propias durante este proyecto —en vez de simplemente copiar un boilerplate genérico ya armado sin entenderlo— es un ejercicio de síntesis valioso: decidir exactamente dónde va cada pieza de lógica (¿la validación de formato de un campo pertenece al controlador o al servicio? ¿el manejo de un error de negocio específico se traduce a qué código de estado HTTP, y en qué capa se toma esa decisión?) obliga a aplicar activamente los principios de separación de responsabilidades del Tema 1 a decisiones concretas y específicas, en vez de solo entenderlos en abstracto sin haberlos aplicado nunca a un caso real.

**Analogía:** este proyecto integrador es como ensamblar finalmente el motor completo de un automóvil, tras haber estudiado y practicado con cada componente individual por separado (el sistema de combustible, el de encendido, el de refrigeración); ver el motor completo arrancar y funcionar coherentemente, con cada componente colaborando correctamente con los demás, es la validación final de que cada pieza fue realmente comprendida, no solo memorizada de forma aislada.

**¿Por qué es importante?** Este proyecto integrador consolida los doce módulos anteriores del track en un sistema coherente y realmente operativo, revelando el valor real de cada pieza precisamente en cómo colabora con las demás, no solo en su funcionamiento aislado.

**Diagrama:**

```
Express+middleware (M4) → capa HTTP
Prisma+transacciones (M5) → persistencia con relaciones reales
JWT access/refresh (M6) → protección de rutas integrada con la BD
Supertest+Testcontainers (M7) → verificación del flujo completo end-to-end
Pino+correlation ID (M9) → observabilidad estructurada
Dockerfile multi-stage (M11) → empaquetado final de producción
```

### Tema 3: Qué le falta a esta API para producción real

**Conceptos clave:** honestidad sobre las limitaciones del proyecto, próximos pasos de aprendizaje.

Una API "completa" en el contexto de este curso, aunque integra correctamente todos los módulos estudiados, todavía carece de varios elementos que un sistema de producción real y maduro necesitaría, y reconocer honestamente estas limitaciones es parte del ejercicio de madurez profesional que este proyecto busca fomentar. Monitoreo activo con alertas (no solo logs pasivos que alguien debe revisar manualmente) sobre métricas clave del servicio, en la línea de lo estudiado en el Módulo 9 del track DevOps (Prometheus/Grafana con reglas de alerta reales), es necesario para detectar proactivamente problemas antes de que un usuario los reporte, en vez de depender exclusivamente de logs que solo se consultan reactivamente después de que algo ya falló visiblemente.

Un plan de migración de base de datos sin downtime para cambios de esquema en producción (más elaborado que simplemente ejecutar `prisma migrate dev` en un entorno de desarrollo local) es necesario para aplicaciones con tráfico real continuo, donde una migración mal planificada podría bloquear tablas críticas durante un período inaceptablemente largo, o donde cambios incompatibles requieren una estrategia de migración gradual y cuidadosamente orquestada en múltiples pasos, no una aplicación directa e inmediata del cambio completo de una sola vez.

La gestión de secretos fuera del código (usando un servicio dedicado como Secrets Manager o Vault, exactamente lo estudiado en profundidad tanto en el Módulo 12 del track DevOps como en el Módulo 10 del track Cloud) es necesaria en vez de depender de archivos `.env` locales una vez que la aplicación pasa de un contexto de aprendizaje a un contexto de producción real con datos sensibles genuinos. Y pruebas de carga (simular tráfico realista a escala para conocer los límites reales de capacidad de la aplicación antes de que los usuarios reales los encuentren de forma inesperada durante un pico de tráfico genuino) completan el panorama de lo que separa este proyecto integrador educativo de un sistema verdaderamente listo para soportar tráfico de producción real y crítico para un negocio.

**Analogía:** este proyecto integrador es como un vehículo prototipo completamente funcional que ya incorpora todos los sistemas esenciales (motor, frenos, dirección) y que efectivamente puede conducirse con éxito en condiciones controladas; llevarlo a producción real es como someterlo a las pruebas de choque, de resistencia y de producción en masa que un fabricante automotriz real exige antes de certificarlo para la venta pública masiva a millones de conductores con condiciones de uso impredecibles.

**¿Por qué es importante?** Reconocer honestamente qué le falta a este proyecto para producción real (monitoreo activo, migraciones sin downtime, gestión de secretos, pruebas de carga) es tan valioso como haber construido correctamente lo que sí incluye, y traza un mapa claro y concreto de los próximos pasos de aprendizaje más allá de este track.

**Diagrama:**

```
Este proyecto integrador incluye:          Producción real adicionalmente necesita:
✓ Arquitectura por capas                    ☐ Monitoreo activo con alertas
✓ Auth JWT + persistencia real               ☐ Migraciones sin downtime en producción
✓ Tests de integración end-to-end             ☐ Gestión de secretos (Vault/Secrets Manager)
✓ Logging estructurado + correlation ID        ☐ Pruebas de carga a escala real
✓ Dockerfile de producción
```

### Tema 4: Próximos pasos — microservicios, colas de mensajes y TypeScript

**Conceptos clave:** descomposición en servicios, Kafka/RabbitMQ, tipado estático en Node.

Más allá de este track, un camino natural de profundización es la arquitectura de microservicios: descomponer una API monolítica (como la construida en este proyecto) en servicios más pequeños e independientes, cada uno responsable de un dominio de negocio específico, comunicándose entre sí mediante APIs síncronas (REST o gRPC, estudiados en el Módulo 9) o mediante colas de mensajes asíncronas. Kafka y RabbitMQ son las dos tecnologías de mensajería más ampliamente adoptadas para este propósito: RabbitMQ implementa un modelo de colas de mensajes más tradicional orientado a tareas discretas (con cierto parentesco conceptual con BullMQ del Módulo 8, aunque a una escala y con garantías distintas), mientras que Kafka está diseñado específicamente para flujos de eventos de alto volumen y sostenido, con la capacidad distintiva de retener el historial completo de eventos durante un período configurable, permitiendo que múltiples consumidores distintos procesen el mismo flujo de eventos de forma independiente y en momentos distintos.

Adoptar TypeScript en un proyecto Node (ejecutado directamente en desarrollo con herramientas como `tsx` o `ts-node`, que compilan y ejecutan TypeScript sobre la marcha sin un paso de compilación manual separado previo) extiende al backend los mismos beneficios de seguridad de tipos estudiados en profundidad en el Módulo 11 del track de JavaScript: capturar errores de tipo en tiempo de compilación, documentación implícita verificada por el compilador, y mejor autocompletado del editor, beneficios que se vuelven cada vez más valiosos a medida que una base de código Node crece en tamaño y en número de colaboradores del equipo.

Este proyecto integrador y el track completo de Node.js, combinados con el conocimiento ya adquirido de JavaScript, DevOps y Cloud, constituyen una base sólida y coherente para abordar cualquiera de estos próximos pasos de profundización con criterio informado, entendiendo no solo la sintaxis específica de cada nueva herramienta, sino el problema real y concreto que cada una resuelve dentro del panorama más amplio de construir y operar sistemas backend robustos a escala creciente.

**Analogía:** completar este track de Node.js es como haber aprendido a construir y operar completamente un restaurante individual exitoso; los microservicios y las colas de mensajes son el siguiente nivel de complejidad, equivalente a coordinar una cadena completa de restaurantes especializados que colaboran entre sí (una cocina central de preparación, sucursales de servicio, un sistema de distribución), cada uno responsable de una parte específica de una operación mucho más grande y distribuida.

**¿Por qué es importante?** Conocer el panorama de microservicios, colas de mensajes y TypeScript en Node traza próximos pasos concretos y bien fundamentados de profundización, construidos directamente sobre la base sólida establecida por este track completo.

**Diagrama:**

```
Monolito (este proyecto) → descomposición en microservicios independientes
                                    │
                        comunicación síncrona (REST/gRPC)
                        o asíncrona (RabbitMQ: colas discretas / Kafka: flujos de eventos)

TypeScript + tsx/ts-node → mismos beneficios de tipos del track de JavaScript, aplicados al backend
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir la API productiva final integrando arquitectura por capas, autenticación, persistencia, testing y un contenedor de producción listo para desplegar.

**Requisitos previos:** todos los Módulos 0-11 completados.

| Paso | Acción | Detalle | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura por capas | rutas → controladores → servicios → repositorio | Sin mezclar responsabilidades entre capas |
| 2 | Implementar autenticación JWT completa | Login, refresh, rutas protegidas | Integrada con la base de datos real |
| 3 | Agregar persistencia con una relación real | Al menos una relación uno-a-muchos con Prisma | Verifica con `include` que la relación funciona |
| 4 | Escribir tests de integración del flujo crítico | Supertest + Testcontainers | Cubre de principio a fin, no solo funciones aisladas |
| 5 | Agregar logging estructurado y `/health` | Correlation ID en cada log de cada request | Verifica la conexión a la base de datos en el healthcheck |
| 6 | Construir el Dockerfile de producción | Multi-stage, optimizado | Documenta cómo desplegarías esta API a un proveedor real |

**Verificación:** el laboratorio se considera exitoso si la API completa funciona de principio a fin (registro, login, operación protegida, refresh), si los tests de integración pasan contra una base de datos real y efímera, y si la imagen Docker de producción construida es funcional y optimizada.

**Errores comunes y soluciones**

- **Mezclar lógica de negocio directamente en las rutas.** Refactoriza hacia controladores y servicios según la arquitectura por capas del Tema 1.
- **Tests de integración que en realidad mockean toda la persistencia.** Verifica que al menos algunos tests críticos usan Testcontainers con una base de datos real, no solo mocks completos.
- **Olvidar documentar honestamente las limitaciones del proyecto para producción real.** Incluye explícitamente qué le faltaría (monitoreo activo, migraciones sin downtime, gestión de secretos, pruebas de carga).

---

## Ejercicios de evaluación

### Ejercicio 1: Justificar decisiones de arquitectura propias

**Enunciado:** describe una decisión de arquitectura que tomaste en este proyecto (por ejemplo, dónde ubicar una validación específica) y justifica por qué la ubicaste en esa capa en particular y no en otra.

**Solución esperada:** una respuesta válida podría ser: ubicar la validación de "el título de una tarea no puede estar vacío" en la capa de servicio (no en el controlador ni en el repositorio), porque es una regla de negocio del dominio (no depende de HTTP ni de la base de datos específica usada), y debe aplicarse consistentemente sin importar desde qué controlador o incluso desde qué otro servicio se invoque esa lógica de creación de tareas.

**Criterios de éxito:**
- Justifica la decisión en términos de qué capa es responsable de qué tipo de lógica según los principios del Tema 1.

### Ejercicio 2: Reconsiderar una decisión de diseño

**Enunciado:** describe qué parte de este proyecto integrador te hizo reconsiderar una decisión de diseño anterior, y qué cambiaste como resultado.

**Solución esperada:** una respuesta razonable y realista podría describir, por ejemplo, haber descubierto al escribir los tests de integración del Módulo 7 que cierta lógica de validación estaba duplicada entre el controlador y el servicio, llevando a refactorizarla para que existiera en un único lugar (el servicio), consolidando la fuente de verdad de esa regla de negocio.

**Criterios de éxito:**
- Describe una reconsideración de diseño concreta y plausible, con la corrección aplicada como resultado.

### Ejercicio 3: Qué le falta a esta API para producción real

**Enunciado:** enumera al menos dos elementos concretos que le faltarían a esta API para considerarla verdaderamente lista para tráfico real de producción, más allá de lo cubierto en este proyecto.

**Solución esperada:** dos respuestas razonables: (1) monitoreo activo con alertas reales sobre métricas de la aplicación, no solo logs pasivos que alguien debe revisar manualmente; (2) gestión de secretos mediante un servicio dedicado (Secrets Manager/Vault) en vez de archivos `.env` locales, además de pruebas de carga para conocer los límites reales de capacidad antes de que el tráfico real los encuentre por sorpresa.

**Criterios de éxito:**
- Enumera al menos dos elementos concretos y correctamente identificados como faltantes para producción real.

---

## Resumen del módulo

**Puntos clave**

- Una arquitectura por capas (rutas, controladores, servicios, repositorio) separa responsabilidades, facilitando testing aislado y cambios de implementación sin afectar el resto del sistema.
- Este proyecto integra coherentemente Express, Prisma, JWT, Supertest/Testcontainers, Pino y Docker en un único sistema funcional, no solo ejercicios aislados de cada módulo.
- Reconocer honestamente qué le falta a este proyecto para producción real (monitoreo activo, migraciones sin downtime, gestión de secretos, pruebas de carga) es parte esencial de la madurez profesional.
- Microservicios, colas de mensajes (Kafka/RabbitMQ) y TypeScript en Node son los próximos pasos naturales de profundización más allá de este track.

**Conceptos aprendidos**

- Diseño y aplicación práctica de una arquitectura por capas.
- Integración coherente de todos los módulos del track en un proyecto funcional único.
- Reconocimiento honesto de las limitaciones de un proyecto educativo frente a producción real.
- Panorama de próximos pasos: microservicios, colas de mensajes y TypeScript.

**Próximos pasos**

Con el track de Node.js completo, el siguiente paso natural es el track de Angular o React (para construir el frontend que consume esta API), o profundizar directamente en microservicios y colas de mensajes para escalar arquitecturas backend más complejas.

**Recursos adicionales**

- El libro "Node.js Design Patterns" (Mario Casciaro, Luciano Mammino) para profundizar en patrones de arquitectura backend con Node.
- Documentación oficial de Apache Kafka y de RabbitMQ.
- Documentación de `tsx` y `ts-node` para adoptar TypeScript en proyectos Node existentes.
