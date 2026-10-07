# Plan de mejora — octubre 2026

Punto de partida real, no estimado: `git pull` trajo 238 commits que faltaban (el checkout
local estaba desde julio) y resolvió solo la mayoría de lo que parecía "roto" — imagen de
`stackport`, puerto del `.env.example`, README sin los 4 tracks móviles, contenido del track
Cloud. Lo que queda después de sincronizar es lo que sigue.

## 1. Técnico — ya resuelto hoy

- **Dependencia `mermaid` faltante** (`web/node_modules`): el `package.json` ya la pedía
  (`^11.16.0`) pero nunca se corrió `npm install` después del pull que la agregó. Instalada.
- **Caché de Angular desactualizada** (`web/.angular/cache`) causaba un error de compilación
  fantasma (`Cannot find module 'mermaid'`) incluso con el paquete ya instalado. Borrada.
- **Playwright sin navegadores instalados** en esta máquina — en curso.

## 2. Contenido editorial — lo que de verdad falta

Dos auditorías propias del repo (`docs/topic-learning-quality.md`, `docs/student-journey-audit.md`)
miden lo mismo desde ángulos distintos y coinciden en los mismos tracks débiles. Esto no es "la
página está rota" — es contenido pedagógico real pendiente de escribir, medido por el propio
estándar del proyecto (`docs/ESTANDAR-DE-CODIGO.md`, `docs/METODOLOGIA-DE-APRENDIZAJE.md`).

**Diagnóstico por track (de `topic-learning-quality.md`, columna "Practicable" = cumple los 9
criterios a la vez; "Texto genérico"/"Demo repetida" = la señal de calidad más grave):**

| Track | Temas | Practicable | Texto genérico | Proyecto conectado |
|---|---:|---:|---:|---:|
| **cloud** | 153 | 30 (20%) | 123 | 15 (10%) |
| **ios** | 51 | 4 (8%) | 47 | 10 (20%) |
| **react** | 55 | 8 (15%) | 47 | 9 (16%) |
| **flutter** | 57 | 15 (26%) | 42 | 10 (18%) |
| **foundations** | 50 | 24 (48%) | 26 | 0 (0%) |
| kotlin-multiplatform | 54 | 35 (65%) | 19 | 11 |
| devops | 91 | 78 (86%) | 13 | 14 |
| node | 68 | 60 (88%) | 8 | 14 |
| angular, javascript, android, java, spring-boot, rutaflow | — | ≥85% | 0 | variable |

**Los 5 tracks de arriba (cloud, ios, react, flutter, foundations) concentran 285 de los 325
temas con texto genérico/demo repetida — el 88% del problema real está ahí, no repartido
parejo en los 14 tracks.**

Un segundo ángulo (`student-journey-audit.md`, simula el recorrido real del estudiante) confirma
el mismo patrón y agrega 2 casos que la tabla anterior no destacaba tanto: **react (1/55
practicables) e ios (2/51)** son los peores con esta medida más estricta; **rutaflow (0/24)** y
**node (6/68)** también salen débiles aquí aunque se veían bien en la otra tabla — vale la pena
revisarlos igual, aunque no sean prioridad 1.

### Por qué importa arrancar por Cloud

Cloud es el track con más temas (153, el más grande de los 14) y es el que le da sentido al
nombre del proyecto — es el que usa Floci de verdad. Tiene la peor proporción de texto
genérico (123/153, el 80% de sus propios temas) y el "Límites" más débil en números absolutos
(33 temas sin explicar límites/trade-offs). Mejorar Cloud primero es lo que más sube el
promedio global y lo que más se nota para cualquiera que entre a probar la academia.

### Por qué Foundations es el otro prioritario, aunque sea chico

Foundations es la puerta de entrada (el primer track que ve cualquier estudiante nuevo) y tiene
**0 de 50 temas conectados a un proyecto propio** — el peor número de "Proyecto" de los 14
tracks, incluso peor en proporción que Cloud. Si el primer track no conecta con un proyecto
real, el estudiante no tiene razón para seguir al segundo.

## 3. Plan de trabajo — Parte A: la guía completa de Floci (track Cloud)

Cloud es el track que de verdad enseña Floci — 35 módulos, 153 temas, y es el más grande de
los 14. 123 de sus 153 temas (80%) están marcados con texto genérico o demo repetida. El
problema **no está repartido uniforme**: empieza en el módulo 2 (los módulos 0-1, introducción
e instalación, ya están limpios) y se mantiene parejo (2 a 6 temas con problema por módulo)
hasta el final.

**Tabla completa, módulo por módulo (orden de ejecución sugerido = orden del propio track):**

| # | Módulo | Temas con problema |
|---:|---|---:|
| 2 | Almacenamiento en la nube con S3 | 4 |
| 3 | Mensajería asíncrona con SQS | 4 |
| 4 | Bases de datos NoSQL con DynamoDB | 6 |
| 5 | Serverless con Lambda | 6 |
| 6 | APIs con API Gateway | 5 |
| 7 | Identidad y acceso con IAM | 4 |
| 8 | Azure y GCP con Floci | 3 |
| 9 | Proyecto final — Sistema de Gestión de Tareas | 4 |
| 10 | Secretos y configuración (Secrets Manager/Key Vault/Secret Manager) | 3 |
| 11 | Mensajería Pub/Sub (SNS, EventBridge, Event Hubs) | 3 |
| 12 | Observabilidad con CloudWatch | 2 |
| 13 | Bases de datos relacionales con RDS | 3 |
| 14 | Contenedores: ECR, ECS, Cloud Run | 3 |
| 16 | Orquestación con Step Functions | 3 |
| 17 | Streaming: Kinesis, MSK, Pub/Sub avanzado | 3 |
| 18 | Autenticación con Cognito | 3 |
| 19 | Analítica con Athena y Glue | 3 |
| 20 | IA: Bedrock, Textract, Transcribe | 3 |
| 21 | Cómputo elástico: EC2 y Auto Scaling | 3 |
| 22 | Balanceo de carga, CDN y DNS (ELB/CloudFront/Route53/ACM) | 5 |
| 23 | Caché en memoria con ElastiCache | 4 |
| 24 | CI/CD nativo (CodeBuild/CodeDeploy) | 4 |
| 25 | Gobierno y continuidad (Config/AppConfig/Backup) | 5 |
| 26 | Streaming avanzado (Firehose/EventBridge Pipes) | 4 |
| 27 | GraphQL (AppSync) y correo (SES) | 3 |
| 28 | Grafos y búsqueda (Neptune/OpenSearch) | 4 |
| 29 | FinOps y gobierno de cuenta | 5 |
| 30 | Transfer Family | 4 |
| 31 | Proyecto integrador multi-nube | 2 |
| 32 | Arquitectura resiliente (redes, landing zones) | 4 |
| 33 | Cloud Master (plataforma/seguridad/datos/FinOps) | 6 |
| 34 | Floci oficial completo | 5 |

*(Módulos 0, 1 y 15 ya están limpios — no necesitan trabajo.)*

**Qué significa "arreglar" un tema de verdad** (regla ya definida en
`docs/editorial-backlog.md`, aplicada en concreto): un tema marcado "texto genérico" o "demo
repetida" tiene explicación, pero el bloque de práctica (el "Paso 4") es intercambiable con
otros 2-3 temas del mismo módulo con solo cambiar el nombre del servicio. Arreglarlo significa
reemplazar ese bloque por: un comando real contra Floci específico de ESE servicio, con salida
real esperada, un fallo real provocado a propósito (ej. permiso IAM faltante, bucket
inexistente, región mal puesta) con su diagnóstico, y una conexión explícita con RutaFlow (el
proyecto integrador) — no un ejemplo aislado.

**Orden de trabajo sugerido dentro de Cloud:** por módulo completo (no por tema suelto) — cada
módulo ya tiene un servicio/tema central, así que cerrar un módulo entero de una vez mantiene
coherencia. Empezar por el **módulo 4 o 5** (DynamoDB/Lambda, 6 temas cada uno, los más
grandes) da el mayor impacto por módulo trabajado.

## 4. Plan de trabajo — Parte B: cómo mejorar el aprendizaje de los otros 13 tracks

**Fase 1 — Foundations (50 temas, la puerta de entrada).** 0 de 50 temas conectados a un
proyecto propio — el peor número de todo el repo. Si el primer track que ve un estudiante
nuevo no conecta con un proyecto real, no hay razón para seguir al segundo. Prioridad más alta
de todo el plan fuera de Cloud, aunque sea el track más chico de los débiles.

**Fase 2 — iOS, React, Flutter (163 temas combinados), en ese orden.** Mismo criterio que
Cloud (texto genérico/demo repetida primero). iOS tiene la peor proporción de temas
"practicables" de los 14 tracks (4%, solo 4 de 51) — es el que menos sirve tal como está hoy.

**Fase 3 — repaso liviano de "Límites" en los tracks que ya están bien.** `node`,
`kotlin-multiplatform`, `angular`, `javascript`, `android` tienen pocos huecos sueltos de
"Límites" (entre 2 y 28 temas cada uno según el track) — cerrarlos es trabajo puntual sobre
temas ya buenos, no una reescritura.

**No tocar sin necesidad:** `java`, `spring-boot`, `devops` ya cumplen el estándar casi
completo. `rutaflow` se ve débil en "Proyecto conectado" (1/24) pero es el proyecto integrador
en sí — revisar con cuidado antes de asumir que necesita el mismo tratamiento que un track de
contenido normal, podría ser una métrica que no aplica igual ahí.

## 5. Cómo verificar cada fase

Después de escribir/editar contenido de un track:

```bash
python3 scripts/audit_topic_learning_quality.py --check
python3 scripts/build_editorial_backlog.py --check
./scripts/validate.sh
```

El número a mirar para saber si una fase está cerrada: columna "Texto genérico" de
`docs/topic-learning-quality.md` en 0 para ese track, y "Proyecto" subiendo de forma real (no
solo "Practicable" subiendo por los otros 8 criterios sueltos).
