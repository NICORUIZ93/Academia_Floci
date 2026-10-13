# Bloque 15: Testing y clientes API

Este bloque contiene 2 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 41: Testing de software

**Meta:** suite por riesgo con tests rápidos e integración representativa

**Contexto de práctica:** prevenir regresión en reglas de negocio y adaptadores externos

**Conocimientos que conecta:** Java, Spring, CI y diagnóstico

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «prevenir regresión en reglas de negocio y adaptadores externos» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: suite por riesgo con tests rápidos e integración representativa.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar testing de software.
- [ ] **Paso 4.** Define un glosario propio para las piezas de JUnit, Mockito, MockMvc, Testcontainers, TDD/BDD, pirámide y cobertura.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de JUnit, Mockito, MockMvc, Testcontainers, TDD/BDD, pirámide y cobertura antes de memorizar términos.
- [ ] **Paso 6.** Prepara JUnit 5, Maven y Testcontainers; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en junit.org/junit5/docs/current/user-guide/ y testcontainers.com una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «prevenir regresión en reglas de negocio y adaptadores externos» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «seguir rojo-verde-refactor y añadir integración real con dependencia aislada» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confundir cobertura alta con detección de defectos o mockear todo» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de JUnit, Mockito, MockMvc, Testcontainers, TDD/BDD, pirámide y cobertura y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «prevenir regresión en reglas de negocio y adaptadores externos» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de testing de software.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a JUnit, Mockito, MockMvc, Testcontainers, TDD/BDD, pirámide y cobertura.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «suite por riesgo con tests rápidos e integración representativa».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en junit.org/junit5/docs/current/user-guide/ y testcontainers.com.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «suite por riesgo con tests rápidos e integración representativa» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta testing de software con Java, Spring, CI y diagnóstico; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «prevenir regresión en reglas de negocio y adaptadores externos» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «suite por riesgo con tests rápidos e integración representativa».

**Criterio de salida:** entrega «suite por riesgo con tests rápidos e integración representativa», explica «confundir cobertura alta con detección de defectos o mockear todo» y demuestra cómo testing de software se conecta con Java, Spring, CI y diagnóstico.

**Fuentes primarias para iniciar:** junit.org/junit5/docs/current/user-guide/ y testcontainers.com.

## Tema 42: Postman vs Bruno

**Meta:** ADR con casos de uso, coste de migración y repositorio sin secretos

**Contexto de práctica:** elegir un cliente API para un equipo con colecciones versionadas

**Conocimientos que conecta:** API testing, Git y automatización CI

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «elegir un cliente API para un equipo con colecciones versionadas» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: ADR con casos de uso, coste de migración y repositorio sin secretos.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar postman vs bruno.
- [ ] **Paso 4.** Define un glosario propio para las piezas de local-first, Git-native, secretos, colaboración y compatibilidad de colecciones.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de local-first, Git-native, secretos, colaboración y compatibilidad de colecciones antes de memorizar términos.
- [ ] **Paso 6.** Prepara Postman y Bruno; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en learning.postman.com/docs y docs.usebruno.com una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «elegir un cliente API para un equipo con colecciones versionadas» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «migrar una colección pequeña y comparar scripts, colaboración y diffs» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «elegir solo por interfaz o subir tokens en archivos de entorno» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de local-first, Git-native, secretos, colaboración y compatibilidad de colecciones y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «elegir un cliente API para un equipo con colecciones versionadas» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de postman vs bruno.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a local-first, Git-native, secretos, colaboración y compatibilidad de colecciones.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «ADR con casos de uso, coste de migración y repositorio sin secretos».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en learning.postman.com/docs y docs.usebruno.com.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «ADR con casos de uso, coste de migración y repositorio sin secretos» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta postman vs bruno con API testing, Git y automatización CI; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «elegir un cliente API para un equipo con colecciones versionadas» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «ADR con casos de uso, coste de migración y repositorio sin secretos».

**Criterio de salida:** entrega «ADR con casos de uso, coste de migración y repositorio sin secretos», explica «elegir solo por interfaz o subir tokens en archivos de entorno» y demuestra cómo postman vs bruno se conecta con API testing, Git y automatización CI.

**Fuentes primarias para iniciar:** learning.postman.com/docs y docs.usebruno.com.
