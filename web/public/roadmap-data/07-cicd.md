# Bloque 7: CI/CD

Este bloque contiene 1 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 29: CI/CD

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
