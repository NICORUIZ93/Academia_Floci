# Integración de biblioteca externa y capturas — progreso

**Propósito de este documento:** registrar el avance de una tarea multi-sesión (puede continuar desde otra máquina) que consiste en:
1. Revisar las ~70 fotos de `~/Downloads` del usuario en busca de información técnica relevante para Academia Floci — **COMPLETO**.
2. Revisar, libro por libro, la biblioteca técnica del disco externo `/Volumes/Nicolas/03_Libros_Biblioteca/` e integrar hallazgos relevantes al contenido de las lecciones — **EN PROGRESO**.

**Importante para retomar en otra máquina:** la biblioteca vive en un disco externo llamado **"Nicolas"**, montado en `/Volumes/Nicolas/`. Sin ese disco conectado, las rutas de esta sección no son accesibles — solo este documento (que sí vive en el repo) y los cambios ya aplicados a las lecciones.

---

## Fase 1 — Capturas de `~/Downloads` (COMPLETA)

Se revisaron las 70 imágenes (JPG/PNG/HEIC) de `~/Downloads`. La mayoría eran capturas de redes sociales (Facebook/Instagram/LinkedIn) mezcladas con contenido personal no relacionado (estudios de ingeniería electrónica/mecánica/aviónica del usuario, memes, fotos personales). A continuación, solo los hallazgos con relevancia real para Academia Floci:

### Alta relevancia — material listo para integrar

| # | Archivo origen | Hallazgo | Track / módulo destino | Estado |
|---|---|---|---|---|
| 1 | IMG_0742.JPG | Patrón **Strategy** en Java: UML + código completo (interfaz, 3 estrategias concretas, contexto, uso, salida) + casos reales (pago, envíos, descuentos, recomendaciones IA) | Java → Clean Code/Patrones | ✅ Integrado en Java 12 con laboratorio original ejecutable; captura no releída en esta sesión |
| 2 | IMG_0744.JPG | Patrón **Singleton** en Java: 5 implementaciones (eager, lazy, thread-safe sincronizado, double-checked locking, enum) con ventaja/desventaja de cada una + "cuándo usarlo" + problemas (viola SRP, difícil de mockear, anti-patrón si se abusa) | Java → Clean Code/Patrones | ✅ Integrado en Java 12 con laboratorio original ejecutable; captura no releída en esta sesión |
| 3 | IMG_0745.JPG | Patrón **Observer** en Java: UML + código completo (Subject/Observer/ConcreteSubject/ConcreteObserver A/B/C) + salida en consola + casos reales (notificaciones redes sociales, dashboards en tiempo real, eventos GUI, mensajería, logs/auditoría) | Java → Clean Code/Patrones | ✅ Integrado en Java 12 con laboratorio original ejecutable; captura no releída en esta sesión |
| 4 | IMG_0873.PNG | Estructura de proyecto Java Spring Boot empresarial: Clean Architecture + DDD + Hexagonal (domain/application/infrastructure/api/shared), stack (Spring Boot, PostgreSQL, Kafka, Redis, Docker, OpenAPI/Swagger, JUnit 5), buenas prácticas (DI, SOLID, validación en bordes, manejo de errores consistente, logs estructurados, observabilidad) | Spring Boot → arquitectura/módulos avanzados | ⬜ Pendiente integrar |
| 5 | IMG_1036.PNG | Patrón de resiliencia Kafka: **Retry Topics + Dead Letter Topic (DLT)**, backoff exponencial (5s/10s/20s), `@DltHandler`, flujo completo de 6 pasos | Spring Boot → módulo Kafka | ⬜ Pendiente verificar si ya se cubre; enriquecer si falta |
| 6 | IMG_1324.PNG | Milestones Spring 2026: Boot 4.2.0-M2, Framework 7.1.0-M2, Spring AI 2.1.0-M1, Data 2026.1.0-M2, Integration 7.2.0-M2, Security 7.2.0-M2, AMQP 4.2.0-M2, Cloud 2026.0.0-M1 (Paddington) | Spring Boot → `docs/official-sources.json` (freshness) | ⬜ Pendiente verificar vigencia de versiones citadas |
| 7 | IMG_1052.PNG | FetchType.LAZY vs EAGER en JPA/Hibernate: comparación clara + error común (N+1) | Spring Boot → módulo JPA/persistencia | ⬜ Pendiente verificar cobertura |
| 8 | IMG_1014.PNG | Angular 22: por qué OnPush + Signals es "el nuevo modelo" de detección de cambios — analogía del cartero, comparativa Default vs OnPush | Angular → Módulo 1-2 (componentes/signals) | ⬜ Pendiente verificar si se explicita la combinación OnPush+Signals |
| 9 | IMG_0950.PNG | `httpResource()` en Angular 22 con caso real (plataforma de empleo para restaurantes, signal que dispara refetch automático) | Angular → Módulo 2 (ya cubre `httpResource()`, este es un buen caso real adicional) | ⬜ Opcional: enriquecer demo existente |
| 10 | IMG_0992.PNG | **OpenTofu**: alternativa libre a Terraform (Linux Foundation) tras cambio de licencia de HashiCorp | DevOps/Cloud → IaC | ⬜ Pendiente evaluar si mencionar como alternativa |
| 11 | IMG_1030.PNG | Especificación completa de app Flutter + Spring Boot con tracking en tiempo real (Riverpod, Google Maps, Socket IO, trazado de rutas, JWT, roles) — mismo dominio que RutaFlow | RutaFlow (Flutter + Spring Boot) → posible inspiración de alcance | ⬜ Informativo, sin acción directa requerida |
| 12 | IMG_0778.JPG | Diagrama claro de JWT (header/payload/signature, flujo cliente→servidor→token, tabla de 6 pasos) — buen referente de estilo visual | React/Node/Spring Boot → módulos de auth (ya cubiertos; sirve como referencia de claridad visual) | ✅ Sin acción (ya cubierto en profundidad) |

### Relevancia media — confirma contenido existente, sin acción requerida
- IMG_0956.PNG: Java Developer Journey (staircase) — valida progresión Java→Spring Boot→Microservicios→Cloud ya usada.
- IMG_1018.PNG: "No deberías empezar aprendiendo Spring Boot" — valida el orden Java→POO→Collections→Spring Boot que ya seguimos.
- IMG_1096.PNG: Evolución de Java 1995-2023 (timeline de versiones) — confirma cobertura esperada.
- IMG_1095.PNG: Spring Boot Build Lifecycle (fases Maven) — confirma cobertura esperada.
- IMG_1053.PNG: Java Multithreading & Concurrency notes — confirma cobertura esperada.
- IMG_1044.PNG: Variables de entorno en Docker (docker run -e, .env, Dockerfile ENV) — confirma cobertura esperada.
- IMG_0935.PNG, IMG_1091.PNG, IMG_0866/0780/0779.JPG: CI/CD, QA Automation (Postman+Jenkins), job postings — contexto de mercado, sin acción.
- IMG_1299.PNG: "Spring Boot + REST + Docker ≠ Microservicios" — buen punto conceptual, posiblemente ya cubierto en el módulo de arquitectura.
- IMG_1315.PNG: 10 patrones de arquitectura (Monolito, Microservicios, Event-Driven, CQRS, Saga, Hexagonal, Serverless, etc.) con "qué resuelve/qué cuesta" — estilo que ya usamos ("Cuándo NO usar").
- IMG_1322/1323/1302.PNG: 3 fuentes adicionales sobre Angular Native — todas confirman el Módulo 16 ya construido (`web/public/content/angular/modulo-16.md`), sin contradicciones. IMG_1322 menciona específicamente "Vitest y Maestro" para testing — dato no incluido en el módulo 16 actual, posible enriquecimiento menor.
- IMG_0127/1127.PNG: "El Gran Libro de Node.js" de Ulises Gascón (core team de Node.js) — libro de alta calidad, gratuito, no está en la biblioteca local del disco externo.
- IMG_1033.PNG: Stack de observabilidad para microservicios (Kafka, RabbitMQ, Zipkin, Grafana, Prometheus) — confirma cobertura esperada; verificar si Zipkin (tracing distribuido) está explícito.
- IMG_1171.JPG: Cheatsheet de atajos de VS Code — posible adición a Foundations (tooling).
- IMG_1093.PNG: Dijkstra con Python (código real con heapq) — relevante para la sección de algoritmos de Foundations.

### Descartado (no aplica a Academia Floci)
~35 imágenes: contenido personal, memes, publicidad de streaming pirata, estudios de ingeniería electrónica/mecánica/aviónica del usuario (circuitos eléctricos, IEC 61131-3, instrumentación de vuelo), cursos genéricos sin información técnica nueva, un prompt de fraude académico (ignorado deliberadamente por motivos éticos).

---

## Fase 2 — Biblioteca externa `/Volumes/Nicolas/03_Libros_Biblioteca/` (EN PROGRESO)

### Cómo retomar
1. Conectar el disco externo "Nicolas".
2. Verificar que monta en `/Volumes/Nicolas/` (`ls /Volumes/`).
3. Continuar la tabla de abajo en orden, marcando cada libro como 🔄 En progreso → ✅ Completo (o ⏭️ Descartado con motivo).
4. Cada hallazgo accionable se registra en la sección "Hallazgos por integrar" al final de este documento, con el archivo de lección exacto a modificar.
5. Tras cada sesión de trabajo, hacer commit de este documento actualizado (aunque los PDFs del disco externo no se puedan ni deban commitear al repo).

### Catálogo inicial de la sesión anterior

**La lista autoritativa de archivos es [la cola de 69 PDFs](biblioteca/cola.md).** La tabla histórica siguiente es parcial y contiene nombres abreviados; usa las rutas reales del catálogo JSON para abrir archivos. Total comprobado: 32.984 páginas. Una versión comprimida y otra original de Core Java I pueden ser el mismo contenido aunque sus huellas difieran.

**Carpeta: `Programacion/Arquitectura_Patrones_CleanCode/`**
| Libro | Track destino | Estado |
|---|---|---|
| Sumergete en los patrones de diseno - Alexander Shvets.pdf | Java (Clean Code/Patrones) | 🔄 Parcial: 3 capítulos; ver `biblioteca/shvets-patrones.md` |
| Programacion_Clean_Code_Manual_Avanzado.pdf | Todos (estándar de código) | 🔄 Portada e índice; capítulos pendientes. Ver `biblioteca/clean-code.md` |
| Introduccion al analisis y diseno de algoritmos - Baase Van Gelder 3ed.pdf | Foundations (algoritmos) | ⬜ Pendiente |

**Carpeta: `Programacion/Java/`**
| Libro | Track destino | Estado |
|---|---|---|
| Core Java Volume I - Fundamentals - 12th Edition.pdf | Java (Fundamentos) | ⬜ Pendiente |
| Core Java Volume II - Advanced Features - 13th Edition.pdf | Java (Avanzado) | ⬜ Pendiente |
| Sznajdleder - Java a fondo 5ed.pdf | Java (Fundamentos, en español) | ⬜ Pendiente |
| Java - Programacion, algoritmos y ejercicios resueltos.pdf | Java (práctica) | ⬜ Pendiente |
| 00165_diseño-en-java-los-23-modelos-de-diseño.pdf | Java (Patrones GoF) | ⬜ Pendiente |
| Programacion_Java_17_Guia_Intermedio.pdf | Java (versión moderna) | ⬜ Pendiente |
| Programacion_Java_Fondo_Edicion_8_Libro_Avanzado.pdf | Java (avanzado) | ⬜ Pendiente |
| java_el_cambio_es_la_unica_constante_2025.pdf | Java (actualidad 2025) | ⬜ Pendiente |

**Carpeta: `Programacion/Web_Frontend_Backend/`**
| Libro | Track destino | Estado |
|---|---|---|
| Spring_Boot_Backend_Arquitectura.pdf | Spring Boot | ⬜ Pendiente |
| Microservicios_Arquitectura_SOFTWARE.pdf | Spring Boot/DevOps | ⬜ Pendiente |
| Programacion_Angular_Framework_Libro_Avanzado.pdf | Angular | ⬜ Pendiente |
| NodeJS/Node.js.pdf | Node | ⬜ Pendiente |
| TypeScript - Curso practico - Carlos Serrano.pdf | React/Node (TypeScript) | ⬜ Pendiente |
| Ingenieria_de_Flutter.pdf | Flutter | ⬜ Pendiente |
| libro de programación javascrip.pdf | JavaScript | ⬜ Pendiente |
| Ruby_on_Rails_Framework.pdf | (sin track directo) | ⏭️ Baja prioridad |

**Carpeta: `Programacion/Mobile_IoT/`**
| Libro | Track destino | Estado |
|---|---|---|
| Programacion_Android_11_Movil_Guia_Intermedio.pdf | Android | ⬜ Pendiente |
| Programacion_Android_Things_IoT_Tutorial_Avanzado.pdf | Android (IoT) | ⬜ Pendiente |
| LIBRO BÁSICO DE ARDUINO.pdf | (sin track directo) | ⏭️ Baja prioridad |

**Carpeta: `Programacion/Docker/`**
| Libro | Track destino | Estado |
|---|---|---|
| Docker - Guia practica - Dogram Code.pdf | DevOps | ⬜ Pendiente |
| Programacion_Docker_Contenedores_Tutorial_Basico.pdf | DevOps | ⬜ Pendiente |

**Carpeta: `Programacion/Sistemas_Linux_DevOps/`**
| Libro | Track destino | Estado |
|---|---|---|
| Linux_manual_de_referencia_(6a.ed)_Petersen.pdf | DevOps (Linux) | ⬜ Pendiente |
| Programacion_Linux_Administracion_Tutorial_Avanzado.pdf | DevOps | ⬜ Pendiente |
| Sistemas Operativos Distribuidos Tanenbaum 1a Ed.pdf | Foundations (sistemas distribuidos) | ⬜ Pendiente |
| Programacion_Kali_Linux_Seguridad_Curso_Profesional.pdf | DevOps/Seguridad | ⏭️ Baja prioridad |

**Carpeta: `Programacion/Seguridad_Hacking/`**
| Libro | Track destino | Estado |
|---|---|---|
| Programacion_Hacking_Etico_Seguridad_Guia_Avanzado.pdf | DevOps/Spring Boot (seguridad transversal) | ⬜ Pendiente |
| El_Libro_Blanco_del_Hacker.pdf | (sin track directo) | ⏭️ Baja prioridad |
| Hacking Dispositivos IOS.pdf | iOS (seguridad) | ⏭️ Baja prioridad |

**Carpeta: `Programacion/Datos_IA_Machine_Learning/`** — sin track directo en Academia Floci hoy (no hay track de IA/ML) → ⏭️ Descartado por ahora.

**Carpeta: `Programacion/Python/`, `R_Matlab_Estadistica/`, `CPP_C_Ensamblador/`, `Otros_Lenguajes/`** — sin track directo (Academia Floci no tiene tracks de Python/C++/R) → ⏭️ Descartado por ahora, salvo que se use para enriquecer Foundations con ejemplos de algoritmos.

**Carpeta: `Bases_Datos/`** (relevante a Cloud/Spring Boot vía SQL)
| Libro | Track destino | Estado |
|---|---|---|
| BasesDatos_SQL_Basico_Tutorial_Basico.pdf | Foundations (SQL) | ⬜ Pendiente |
| BasesDatos_Oracle_SQL_Guia_Intermedio.pdf | Spring Boot/Cloud (SQL avanzado) | ⬜ Pendiente |
| BasesDatos_NoSQL_Introduccion_Manual_Basico.pdf | Cloud (DynamoDB y NoSQL en general) | ⬜ Pendiente |
| BasesDatos_Oracle_Forms_Reports_Manual_Avanzado.pdf | (sin track directo) | ⏭️ Baja prioridad |
| BasesDatos_SQL_Excel_Integracion_Guia_Intermedio.pdf | (sin track directo) | ⏭️ Baja prioridad |

**Carpeta: `Inteligencia_Artificial/`** — sin track directo en Academia Floci hoy → ⏭️ Descartado por ahora.

**Carpeta: `Matematicas/Matematicas_Discretas/`**
| Libro | Track destino | Estado |
|---|---|---|
| Matematicas_Discretas_Combinatoria_Guia_Intermedio.pdf | Foundations (matemáticas/algoritmos) | ⬜ Pendiente |

### Orden de prioridad sugerido (por impacto directo en tracks existentes)
1. Sumergete en los patrones de diseño - Shvets (ya tenemos 3 patrones de las fotos; este libro puede dar más para completar el catálogo GoF)
2. Core Java Volume I y II (Horstmann) — fundamento del track Java
3. Spring_Boot_Backend_Arquitectura.pdf + Microservicios_Arquitectura_SOFTWARE.pdf
4. Programacion_Angular_Framework_Libro_Avanzado.pdf
5. Node.js.pdf + TypeScript - Curso practico
6. Ingenieria_de_Flutter.pdf
7. Programacion_Android_11_Movil_Guia_Intermedio.pdf
8. Docker (ambos) + Linux_manual_de_referencia
9. Introduccion al analisis y diseno de algoritmos - Baase (Foundations)
10. BasesDatos_SQL_Basico + Oracle_SQL (Foundations/Cloud)
11. Matematicas_Discretas_Combinatoria (Foundations)
12. Resto de libros de baja prioridad (sin track directo hoy)

---

## Hallazgos por integrar (se completa a medida que se revisan libros)

Ver [revisión de Shvets](biblioteca/shvets-patrones.md): capítulos, páginas, destinos y ejecuciones registradas. El resto de libros conserva su estado pendiente.

---

## Continuidad entre máquinas — actualización 2026-10-13

- Inventario verificable: [biblioteca/catalogo.json](biblioteca/catalogo.json), rutas relativas, SHA-256 y número de páginas. Catalogado no significa leído.
- Laboratorio integrado: `web/public/content/java/modulo-12.md`; código en `examples/java/patrones-rutaflow/`.
- Registro de lectura: [biblioteca/shvets-patrones.md](biblioteca/shvets-patrones.md).
- Los estados de las imágenes provienen de la sesión anterior; esta sesión no ha repetido la revisión de las 70 capturas.
- No declarar completada la biblioteca ni la plataforma a partir de un inventario o de validadores estructurales.

Para regenerar el inventario desde otra máquina, monta la biblioteca donde corresponda y usa esa ruta como `--root`:

```sh
python3 -m venv /tmp/floci-library-venv
/tmp/floci-library-venv/bin/pip install pymupdf
/tmp/floci-library-venv/bin/python scripts/catalog_external_library.py --root /ruta/a/03_Libros_Biblioteca
```

El catálogo no contiene libros ni extracción de páginas. Conserva las notas de lectura separadas para que regenerarlo no borre el avance. Una misma huella SHA-256 identifica copias idénticas; títulos iguales no bastan.

## Siguiente acción concreta

Continuar Shvets con principios de diseño (PDF 35–75) y Factory Method (PDF 79–95), contrastar con Java 12 y documentar cobertura. Después continuar el orden libro por libro, con alcance de lectura explícito para cada fuente. La ausencia de un track dedicado no descarta automáticamente un libro: revisar primero su posible aporte a Foundations.

## Verificación del primer incremento

Tres programas Java ejecutados en modo normal (código 0) y con fallo deliberado (código 1); mensajes cotejados. El inventario es técnico: no equivale a lectura de los 69 libros. Los controles del repositorio no certifican por sí solos profundidad pedagógica.

## Recuperar este incremento en otra PC

Rama de continuidad: `codex/biblioteca-continuidad-20261013`. Con el repositorio clonado y el árbol de trabajo limpio:

```sh
git fetch origin
git switch --track origin/codex/biblioteca-continuidad-20261013
```

Si la rama ya existe localmente, usa `git switch codex/biblioteca-continuidad-20261013`. Abre este documento y `docs/biblioteca/cola.md`, conecta el disco y ajusta `--root`. Los PDFs permanecen en el disco externo. Esta rama contiene únicamente el incremento de biblioteca y Java; los cambios locales anteriores de interfaz y Flutter siguen en el área de trabajo original.

Validación: `./scripts/validate.sh` completada con código 0 tanto en el área original como en una copia aislada basada en `cbdf1ac`. El conteo estructural de metodología informa 478/935 temas completos; no se declara la academia al 100 %.
