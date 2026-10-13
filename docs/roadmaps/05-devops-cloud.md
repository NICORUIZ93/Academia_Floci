# Bloque 5: DevOps y cloud

Este bloque contiene 6 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 28: Docker

**Meta:** imagen mínima, .dockerignore, healthcheck y variables explicadas

**Contexto de práctica:** empaquetar una API Java reproducible y segura

**Conocimientos que conecta:** Maven, CI/CD, Kubernetes y Floci

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «empaquetar una API Java reproducible y segura» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: imagen mínima, .dockerignore, healthcheck y variables explicadas.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar docker.
- [ ] **Paso 4.** Define un glosario propio para las piezas de imágenes, capas, volúmenes, redes, -e, .env, ENV, Compose, multi-stage y no-root.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de imágenes, capas, volúmenes, redes, -e, .env, ENV, Compose, multi-stage y no-root antes de memorizar términos.
- [ ] **Paso 6.** Prepara Docker Engine/OrbStack y BuildKit; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.docker.com/get-started/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «empaquetar una API Java reproducible y segura» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «comparar imagen multi-stage con una imagen de desarrollo y examinar usuario efectivo» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «incluir secretos en ENV o construir como root sin necesidad» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de imágenes, capas, volúmenes, redes, -e, .env, ENV, Compose, multi-stage y no-root y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «empaquetar una API Java reproducible y segura» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de docker.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a imágenes, capas, volúmenes, redes, -e, .env, ENV, Compose, multi-stage y no-root.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «imagen mínima, .dockerignore, healthcheck y variables explicadas».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.docker.com/get-started/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «imagen mínima, .dockerignore, healthcheck y variables explicadas» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta docker con Maven, CI/CD, Kubernetes y Floci; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «empaquetar una API Java reproducible y segura» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «imagen mínima, .dockerignore, healthcheck y variables explicadas».

**Criterio de salida:** entrega «imagen mínima, .dockerignore, healthcheck y variables explicadas», explica «incluir secretos en ENV o construir como root sin necesidad» y demuestra cómo docker se conecta con Maven, CI/CD, Kubernetes y Floci.

**Fuentes primarias para iniciar:** docs.docker.com/get-started/.

## Tema 29: Alternativas a Docker Desktop

**Meta:** tabla de decisión reproducible con comandos y límites observados

**Contexto de práctica:** levantar un laboratorio de contenedores con preferencias locales

**Conocimientos que conecta:** Docker, virtualización y flujo de desarrollo

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «levantar un laboratorio de contenedores con preferencias locales» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: tabla de decisión reproducible con comandos y límites observados.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar alternativas a docker desktop.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Dory, OrbStack y Podman: compatibilidad, licencia, daemonless y plataforma.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Dory, OrbStack y Podman: compatibilidad, licencia, daemonless y plataforma antes de memorizar términos.
- [ ] **Paso 6.** Prepara Podman u OrbStack según sistema; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en podman.io/docs y documentación oficial del runtime elegido una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «levantar un laboratorio de contenedores con preferencias locales» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «ejecutar el mismo compose y comparar sockets, redes y persistencia» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «asumir que comandos compatibles implican comportamiento idéntico» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Dory, OrbStack y Podman: compatibilidad, licencia, daemonless y plataforma y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «levantar un laboratorio de contenedores con preferencias locales» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de alternativas a docker desktop.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Dory, OrbStack y Podman: compatibilidad, licencia, daemonless y plataforma.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «tabla de decisión reproducible con comandos y límites observados».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en podman.io/docs y documentación oficial del runtime elegido.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «tabla de decisión reproducible con comandos y límites observados» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta alternativas a docker desktop con Docker, virtualización y flujo de desarrollo; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «levantar un laboratorio de contenedores con preferencias locales» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «tabla de decisión reproducible con comandos y límites observados».

**Criterio de salida:** entrega «tabla de decisión reproducible con comandos y límites observados», explica «asumir que comandos compatibles implican comportamiento idéntico» y demuestra cómo alternativas a docker desktop se conecta con Docker, virtualización y flujo de desarrollo.

**Fuentes primarias para iniciar:** podman.io/docs y documentación oficial del runtime elegido.

## Tema 30: CI/CD

**Meta:** pipeline reproducible con gates, artifacts y estrategia de rollback

**Contexto de práctica:** validar y liberar cambios de una API sin pasos manuales ocultos

**Conocimientos que conecta:** Git, pruebas, contenedores e IaC

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «validar y liberar cambios de una API sin pasos manuales ocultos» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: pipeline reproducible con gates, artifacts y estrategia de rollback.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar ci/cd.
- [ ] **Paso 4.** Define un glosario propio para las piezas de integración, entrega/despliegue continuo, Jenkins, Actions, GitLab, Azure, CircleCI y rollout.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de integración, entrega/despliegue continuo, Jenkins, Actions, GitLab, Azure, CircleCI y rollout antes de memorizar términos.
- [ ] **Paso 6.** Prepara GitHub Actions y Jenkins local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.github.com/actions y jenkins.io/doc/book/pipeline/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «validar y liberar cambios de una API sin pasos manuales ocultos» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «crear build/test/security stages y simular rolling o canary con rollback» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confundir pipeline verde con despliegue seguro o guardar secretos en YAML» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de integración, entrega/despliegue continuo, Jenkins, Actions, GitLab, Azure, CircleCI y rollout y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «validar y liberar cambios de una API sin pasos manuales ocultos» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de ci/cd.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a integración, entrega/despliegue continuo, Jenkins, Actions, GitLab, Azure, CircleCI y rollout.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «pipeline reproducible con gates, artifacts y estrategia de rollback».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.github.com/actions y jenkins.io/doc/book/pipeline/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «pipeline reproducible con gates, artifacts y estrategia de rollback» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta ci/cd con Git, pruebas, contenedores e IaC; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «validar y liberar cambios de una API sin pasos manuales ocultos» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «pipeline reproducible con gates, artifacts y estrategia de rollback».

**Criterio de salida:** entrega «pipeline reproducible con gates, artifacts y estrategia de rollback», explica «confundir pipeline verde con despliegue seguro o guardar secretos en YAML» y demuestra cómo ci/cd se conecta con Git, pruebas, contenedores e IaC.

**Fuentes primarias para iniciar:** docs.github.com/actions y jenkins.io/doc/book/pipeline/.

## Tema 31: Kubernetes

**Meta:** manifiestos comentados con probes, límites y prueba de rollout

**Contexto de práctica:** mantener disponible la API de entregas durante cambios

**Conocimientos que conecta:** Docker, CI/CD, redes y observabilidad

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «mantener disponible la API de entregas durante cambios» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: manifiestos comentados con probes, límites y prueba de rollout.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar kubernetes.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA, Helm y probes.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA, Helm y probes antes de memorizar términos.
- [ ] **Paso 6.** Prepara kind o minikube; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en kubernetes.io/docs/concepts/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «mantener disponible la API de entregas durante cambios» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «romper readiness deliberadamente y observar cómo cambia el tráfico» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «usar liveness para dependencias externas o almacenar secretos en ConfigMap» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA, Helm y probes y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «mantener disponible la API de entregas durante cambios» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de kubernetes.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, HPA, Helm y probes.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «manifiestos comentados con probes, límites y prueba de rollout».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en kubernetes.io/docs/concepts/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «manifiestos comentados con probes, límites y prueba de rollout» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta kubernetes con Docker, CI/CD, redes y observabilidad; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «mantener disponible la API de entregas durante cambios» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «manifiestos comentados con probes, límites y prueba de rollout».

**Criterio de salida:** entrega «manifiestos comentados con probes, límites y prueba de rollout», explica «usar liveness para dependencias externas o almacenar secretos en ConfigMap» y demuestra cómo kubernetes se conecta con Docker, CI/CD, redes y observabilidad.

**Fuentes primarias para iniciar:** kubernetes.io/docs/concepts/.

## Tema 32: Terraform y OpenTofu

**Meta:** módulo pequeño con backend documentado y plan revisado

**Contexto de práctica:** provisionar infraestructura local/cloud de forma revisable

**Conocimientos que conecta:** cloud local, CI/CD, secretos y control de cambios

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «provisionar infraestructura local/cloud de forma revisable» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: módulo pequeño con backend documentado y plan revisado.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar terraform y opentofu.
- [ ] **Paso 4.** Define un glosario propio para las piezas de HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle antes de memorizar términos.
- [ ] **Paso 6.** Prepara Terraform u OpenTofu en laboratorio; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en developer.hashicorp.com/terraform/docs y opentofu.org/docs una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «provisionar infraestructura local/cloud de forma revisable» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «ejecutar fmt/validate/plan y destruir únicamente recursos de sandbox» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «editar state manualmente o ejecutar apply sin revisar el plan» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «provisionar infraestructura local/cloud de forma revisable» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de terraform y opentofu.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a HCL, providers, variables, outputs, state, backend remoto, módulos y lifecycle.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «módulo pequeño con backend documentado y plan revisado».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en developer.hashicorp.com/terraform/docs y opentofu.org/docs.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «módulo pequeño con backend documentado y plan revisado» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta terraform y opentofu con cloud local, CI/CD, secretos y control de cambios; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «provisionar infraestructura local/cloud de forma revisable» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «módulo pequeño con backend documentado y plan revisado».

**Criterio de salida:** entrega «módulo pequeño con backend documentado y plan revisado», explica «editar state manualmente o ejecutar apply sin revisar el plan» y demuestra cómo terraform y opentofu se conecta con cloud local, CI/CD, secretos y control de cambios.

**Fuentes primarias para iniciar:** developer.hashicorp.com/terraform/docs y opentofu.org/docs.

## Tema 33: Cloud local con LocalStack y Floci

**Meta:** laboratorio local repetible con teardown y límites anotados

**Contexto de práctica:** probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud

**Conocimientos que conecta:** Docker, SDKs cloud, mensajería y pruebas

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: laboratorio local repetible con teardown y límites anotados.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar cloud local con localstack y floci.
- [ ] **Paso 4.** Define un glosario propio para las piezas de StackPort, AWS CLI local, endpoints 4566/4577/4588 y credenciales test/test en us-east-1.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de StackPort, AWS CLI local, endpoints 4566/4577/4588 y credenciales test/test en us-east-1 antes de memorizar términos.
- [ ] **Paso 6.** Prepara Docker Compose, Floci y AWS CLI; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en README/guía oficial del emulador y AWS CLI Command Reference una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «crear bucket y cola, enviar mensaje y comprobar estado/puerto del emulador» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «usar credenciales de laboratorio contra nube real o asumir paridad completa» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de StackPort, AWS CLI local, endpoints 4566/4577/4588 y credenciales test/test en us-east-1 y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de cloud local con localstack y floci.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a StackPort, AWS CLI local, endpoints 4566/4577/4588 y credenciales test/test en us-east-1.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «laboratorio local repetible con teardown y límites anotados».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en README/guía oficial del emulador y AWS CLI Command Reference.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «laboratorio local repetible con teardown y límites anotados» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta cloud local con localstack y floci con Docker, SDKs cloud, mensajería y pruebas; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «probar S3, SQS, SNS, Lambda y DynamoDB sin una cuenta cloud» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «laboratorio local repetible con teardown y límites anotados».

**Criterio de salida:** entrega «laboratorio local repetible con teardown y límites anotados», explica «usar credenciales de laboratorio contra nube real o asumir paridad completa» y demuestra cómo cloud local con localstack y floci se conecta con Docker, SDKs cloud, mensajería y pruebas.

**Fuentes primarias para iniciar:** README/guía oficial del emulador y AWS CLI Command Reference.
