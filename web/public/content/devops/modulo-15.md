# Módulo 15: DevOps Master: GitOps, Service Mesh y DevSecOps


## Aprende construyendo

### Tema 1: Docker y Compose avanzados

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Docker y Compose avanzados se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Docker y Compose avanzados aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 2: Kubernetes extensible y Helm avanzado

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Kubernetes extensible y Helm avanzado se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Kubernetes extensible y Helm avanzado aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 3: Service Mesh con Istio o Linkerd

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Service Mesh con Istio o Linkerd se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Service Mesh con Istio o Linkerd aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 4: GitOps con Argo CD y Flux

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

GitOps con Argo CD y Flux se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque GitOps con Argo CD y Flux aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 5: Ansible, inventarios, roles y Vault

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

Ansible, inventarios, roles y Vault se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque Ansible, inventarios, roles y Vault aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```
### Tema 6: DevSecOps y métricas DORA

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: instala las herramientas oficiales indicadas y verifica sus versiones.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta práctica protege, automatiza u opera una API de entregas con cambios trazables y recuperación ante fallos.

#### Paso 3 · Teoría, modelo mental y analogía
Define el contrato, el flujo, los límites y la métrica que demuestra éxito. La analogía es una cadena de producción: cada etapa valida una propiedad y deja evidencia para la siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-operacion
cd ejemplo-operacion
printf "configuracion\n" > README.md
git init
docker --version
git status
```
Crea src/example.config o el archivo principal del tema y ejecuta la herramienta real; documenta ruta, comandos y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración para provocar un fallo deliberado; lee el diagnóstico, corrígelo y vuelve a ejecutar. Resultado esperado: verificación verde y evidencia reproducible.

#### Paso 6 · Práctica independiente
Añade un caso normal, uno límite y uno inválido; automatiza una comprobación y documenta rollback, seguridad y observabilidad.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, logs, captura y decisión; como siguiente paso intégralo en CI/CD. Errores comunes: versiones flotantes, secretos en repositorio, probar solo el camino feliz y no definir responsable de la alerta. Fuentes oficiales: https://12factor.net/ y https://sre.google/sre-book/.
**¿Por qué es importante?** Porque operar un sistema exige evidencia, límites y recuperación, no solo una ejecución exitosa.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
**Conceptos clave:** propósito, modelo de ejecución, configuración, seguridad, coste, pruebas y operación.

DevSecOps y métricas DORA se estudia como una decisión de ingeniería y no como una colección de comandos. Primero identifica el problema que resuelve y los límites de la plataforma; luego construye el incremento mínimo dentro de RutaFlow. Registra entradas, salidas, dependencias y condiciones de fallo. Compara al menos una alternativa y conserva la medición que justifica la elección. Si la tecnología es experimental, se aísla del camino estable y se documenta la estrategia de retirada.

En producción debes considerar configuración por ambiente, identidad de máquina y persona, secretos, compatibilidad, telemetría y recuperación. Una demostración exitosa no prueba comportamiento bajo concurrencia, reintentos, pérdida de red o datos inválidos. Por eso el laboratorio introduce un fallo deliberado y exige una prueba de regresión. El resultado debe poder repetirse desde terminal y CI sin pasos secretos del editor.

**Analogía:** es como incorporar una nueva estación a una red logística: no basta con construirla; hay que definir rutas, capacidad, controles, contingencias y cómo sabremos que funciona.

**¿Por qué es importante?** Porque DevSecOps y métricas DORA aparece cuando el sistema crece y las decisiones dejan de ser locales. Comprender su coste evita adoptar una herramienta por popularidad o descartarla por una primera experiencia incompleta.

**Casos de uso reales:** operación normal, configuración inválida, dependencia lenta, solicitud duplicada, cambio incompatible y recuperación posterior a un despliegue fallido.

**Diagrama:**

```mermaid
flowchart LR
  A[Requisito RutaFlow] --> B[Decisión y alternativa]
  B --> C[Implementación mínima]
  C --> D[Prueba y medición]
  D --> E[Operación y recuperación]
  E -->|evidencia| B
```


## Trazabilidad de la auditoría original

- **Service Mesh**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **GitOps**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Ansible**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **DevSecOps**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Métricas DORA**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Docker Avanzado**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Docker Compose Avanzado**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Kubernetes Avanzado**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
- **Helm Avanzado**: cubierto mediante fundamento, laboratorio y evidencia del capítulo.
