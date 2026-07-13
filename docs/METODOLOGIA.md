# Metodología de Aprendizaje — Academia Floci

> Cómo convertir cualquier temario (Cloud, DevOps, JavaScript, Node, Angular, React, Java, Spring, móvil) en aprendizaje real, para cualquier perfil: niño, adulto que cambia de carrera o profesional.

## 1. Principios (basados en evidencia)

La ciencia del aprendizaje coincide en 6 técnicas que superan a todas las demás. La metodología completa las combina:

| # | Principio | Qué significa | Cómo se aplica en cada lección |
|---|-----------|---------------|-------------------------------|
| 1 | **Práctica activa (learning by doing)** | Se aprende escribiendo código, no leyendo código | Cada lección tiene un ejercicio obligatorio ANTES de pasar a la siguiente |
| 2 | **Recuerdo activo (active recall)** | Recordar sin mirar fija más que releer | Cada lección termina con 3-5 preguntas sin respuesta visible |
| 3 | **Repetición espaciada (spaced repetition)** | Repasar en intervalos crecientes (1, 3, 7, 21 días) | Cada lección abre con un "repaso relámpago" de 2 lecciones anteriores |
| 4 | **Técnica Feynman** | Si no puedes explicarlo simple, no lo entiendes | Al cerrar cada nivel: "explícalo en 5 frases como si tuvieras 10 años" |
| 5 | **Proyectos con fricción real** | Los errores enseñan más que los tutoriales | Cada módulo culmina en un proyecto sin pasos guiados, solo criterios de éxito |
| 6 | **Intercalado (interleaving)** | Mezclar temas relacionados consolida mejor que bloques puros | Los proyectos integran módulos ya vistos (ej: API Node + Docker + Floci) |

## 2. El ciclo de cada lección (regla 20/60/20)

```
20% LEER      → concepto con analogía + diagrama (máx. 2 pantallas)
60% HACER     → código guiado + ejercicio + romperlo a propósito
20% RECORDAR  → preguntas de recall + explicar con tus palabras
```

**Regla de oro:** ninguna lección se marca como completada sin haber ejecutado código. Ver ≠ saber.

## 3. Ruta por perfil

| Perfil | Ritmo | Punto de entrada | Ajuste |
|--------|-------|------------------|--------|
| Niño / cero absoluto | 15-20 min/día | Nivel Básico, con analogías y juegos | Duplicar ejercicios, saltar capa "internals" |
| Adulto cambio de carrera | 1-2 h/día | Nivel Básico, ritmo normal | Proyectos con contexto de negocio |
| Profesional | 2-3 h/día | Test de nivel → entra en Medio o Avanzado | Salta lo que apruebe en el test; foco en Avanzado/Master |

## 4. Progresión por niveles (por módulo)

Cada módulo se divide en 4 niveles con una compuerta entre cada uno:

```
🟢 BÁSICO ──(mini-proyecto)──▶ 🟡 MEDIO ──(proyecto)──▶ 🟠 AVANZADO ──(proyecto real)──▶ 🔴 MASTER
```

- **Compuerta = proyecto evaluable.** No se avanza de nivel sin entregar el proyecto del nivel anterior.
- **Preguntas de entrevista** al final de cada nivel: básico (junior), medio (mid), avanzado (senior), master (staff/arquitecto).

## 5. Herramientas del alumno

- **Entorno:** Docker + Floci (cloud local gratis), VS Code, Git.
- **Cuaderno de progreso:** checklist por lección + registro de errores encontrados (los errores propios son el mejor material de repaso).
- **IA como tutor, no como autor:** el alumno pide a Claude/Codex que *explique, revise y pregunte*, nunca que escriba la solución completa del ejercicio.

## 6. Cadencia semanal recomendada

| Día | Actividad |
|-----|-----------|
| Lun-Jue | 1 lección nueva/día (ciclo 20/60/20) |
| Vie | Repaso espaciado: recall de la semana + rehacer 1 ejercicio sin mirar |
| Sáb | Avanzar en el proyecto del nivel |
| Dom | Descanso o Feynman: explicar 1 tema en voz alta / escrito |

## 7. Cómo se genera el contenido

Cada lección se genera con IA (Claude o Codex) usando la plantilla estándar de
[`PLANTILLA-LECCION.md`](PLANTILLA-LECCION.md). Esto garantiza que las ~500 lecciones
del temario tengan estructura, tono y calidad idénticos.
