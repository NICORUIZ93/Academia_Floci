# Bloque 9: Herramientas y prácticas

Este bloque contiene 8 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 58: Git y control de versiones

**Meta:** historial revisable con PR, tests, tag y notas de release

**Contexto de práctica:** colaborar en una modificación urgente del flujo de pedidos

**Conocimientos que conecta:** CI, revisión de código y colaboración

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «colaborar en una modificación urgente del flujo de pedidos» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: historial revisable con PR, tests, tag y notas de release.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar git y control de versiones.
- [ ] **Paso 4.** Define un glosario propio para las piezas de commit, branch, merge/rebase, conflictos, PR, trunk-based, tags y releases.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de commit, branch, merge/rebase, conflictos, PR, trunk-based, tags y releases antes de memorizar términos.
- [ ] **Paso 6.** Prepara Git CLI y repositorio de práctica; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en git-scm.com/book/en/v2 una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «colaborar en una modificación urgente del flujo de pedidos» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «resolver un conflicto con intención y etiquetar un release reproducible» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «forzar push a rama compartida o reescribir historia publicada sin acuerdo» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de commit, branch, merge/rebase, conflictos, PR, trunk-based, tags y releases y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «colaborar en una modificación urgente del flujo de pedidos» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de git y control de versiones.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a commit, branch, merge/rebase, conflictos, PR, trunk-based, tags y releases.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «historial revisable con PR, tests, tag y notas de release».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en git-scm.com/book/en/v2.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «historial revisable con PR, tests, tag y notas de release» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta git y control de versiones con CI, revisión de código y colaboración; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «colaborar en una modificación urgente del flujo de pedidos» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «historial revisable con PR, tests, tag y notas de release».

**Criterio de salida:** entrega «historial revisable con PR, tests, tag y notas de release», explica «forzar push a rama compartida o reescribir historia publicada sin acuerdo» y demuestra cómo git y control de versiones se conecta con CI, revisión de código y colaboración.

**Fuentes primarias para iniciar:** git-scm.com/book/en/v2.

## Tema 59: Testing de software

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

## Tema 60: Postman vs Bruno

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

## Tema 61: Patrones de diseño y SOLID

**Meta:** ADR de diseño respaldado por tests y costes de cambio

**Contexto de práctica:** extender cálculo de tarifas sin editar todas las ramas del servicio

**Conocimientos que conecta:** POO, arquitectura, pruebas y microservicios

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «extender cálculo de tarifas sin editar todas las ramas del servicio» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: ADR de diseño respaldado por tests y costes de cambio.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar patrones de diseño y solid.
- [ ] **Paso 4.** Define un glosario propio para las piezas de cinco Singletons, Factory, Builder, Prototype, Adapter, Decorator, Facade, Observer, Strategy, Command, Repository, Clean/Hexagonal.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de cinco Singletons, Factory, Builder, Prototype, Adapter, Decorator, Facade, Observer, Strategy, Command, Repository, Clean/Hexagonal antes de memorizar términos.
- [ ] **Paso 6.** Prepara Java, JUnit y diagramas UML/C4; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en refactoring.guru/design-patterns y Martin Fowler una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «extender cálculo de tarifas sin editar todas las ramas del servicio» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «comparar Strategy con condicionales y probar el cambio de política» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «aplicar patrón porque tiene nombre o esconder estado global en Singleton» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de cinco Singletons, Factory, Builder, Prototype, Adapter, Decorator, Facade, Observer, Strategy, Command, Repository, Clean/Hexagonal y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «extender cálculo de tarifas sin editar todas las ramas del servicio» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de patrones de diseño y solid.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a cinco Singletons, Factory, Builder, Prototype, Adapter, Decorator, Facade, Observer, Strategy, Command, Repository, Clean/Hexagonal.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «ADR de diseño respaldado por tests y costes de cambio».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en refactoring.guru/design-patterns y Martin Fowler.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «ADR de diseño respaldado por tests y costes de cambio» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta patrones de diseño y solid con POO, arquitectura, pruebas y microservicios; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «extender cálculo de tarifas sin editar todas las ramas del servicio» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «ADR de diseño respaldado por tests y costes de cambio».

**Criterio de salida:** entrega «ADR de diseño respaldado por tests y costes de cambio», explica «aplicar patrón porque tiene nombre o esconder estado global en Singleton» y demuestra cómo patrones de diseño y solid se conecta con POO, arquitectura, pruebas y microservicios.

**Fuentes primarias para iniciar:** refactoring.guru/design-patterns y Martin Fowler.

## Tema 62: Algoritmos y estructuras de datos

**Meta:** algoritmos testeados, medidos y vinculados a sus precondiciones

**Contexto de práctica:** hallar ruta de menor coste para una flota de entregas

**Conocimientos que conecta:** Java collections, bases de datos y logística

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «hallar ruta de menor coste para una flota de entregas» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: algoritmos testeados, medidos y vinculados a sus precondiciones.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar algoritmos y estructuras de datos.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Big-O, búsquedas, ordenamientos, hash, árboles, BFS/DFS, Dijkstra y programación dinámica.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Big-O, búsquedas, ordenamientos, hash, árboles, BFS/DFS, Dijkstra y programación dinámica antes de memorizar términos.
- [ ] **Paso 6.** Prepara Python, pytest y profiler; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en visualgo.net y Python docs una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «hallar ruta de menor coste para una flota de entregas» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «implementar Dijkstra, compararlo con BFS en grafos ponderados y validar contra casos conocidos» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «usar búsqueda binaria en datos no ordenados o Dijkstra con pesos negativos» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Big-O, búsquedas, ordenamientos, hash, árboles, BFS/DFS, Dijkstra y programación dinámica y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «hallar ruta de menor coste para una flota de entregas» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de algoritmos y estructuras de datos.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Big-O, búsquedas, ordenamientos, hash, árboles, BFS/DFS, Dijkstra y programación dinámica.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «algoritmos testeados, medidos y vinculados a sus precondiciones».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en visualgo.net y Python docs.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «algoritmos testeados, medidos y vinculados a sus precondiciones» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta algoritmos y estructuras de datos con Java collections, bases de datos y logística; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «hallar ruta de menor coste para una flota de entregas» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «algoritmos testeados, medidos y vinculados a sus precondiciones».

**Criterio de salida:** entrega «algoritmos testeados, medidos y vinculados a sus precondiciones», explica «usar búsqueda binaria en datos no ordenados o Dijkstra con pesos negativos» y demuestra cómo algoritmos y estructuras de datos se conecta con Java collections, bases de datos y logística.

**Fuentes primarias para iniciar:** visualgo.net y Python docs.

## Tema 63: Visual Studio Code

**Meta:** perfil ligero documentado con tareas y atajos usados

**Contexto de práctica:** configurar un flujo de trabajo repetible para estudiar y depurar

**Conocimientos que conecta:** Git, Python/Java, testing y productividad

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «configurar un flujo de trabajo repetible para estudiar y depurar» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: perfil ligero documentado con tareas y atajos usados.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar visual studio code.
- [ ] **Paso 4.** Define un glosario propio para las piezas de atajos, navegación, terminal, debugger, perfiles, extensiones y settings.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de atajos, navegación, terminal, debugger, perfiles, extensiones y settings antes de memorizar términos.
- [ ] **Paso 6.** Prepara VS Code y un repositorio sandbox; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en code.visualstudio.com/docs una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «configurar un flujo de trabajo repetible para estudiar y depurar» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «resolver una incidencia usando búsqueda, breakpoint, test y terminal integrada» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «instalar extensiones indiscriminadamente o versionar secretos de settings» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de atajos, navegación, terminal, debugger, perfiles, extensiones y settings y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «configurar un flujo de trabajo repetible para estudiar y depurar» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de visual studio code.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a atajos, navegación, terminal, debugger, perfiles, extensiones y settings.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «perfil ligero documentado con tareas y atajos usados».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en code.visualstudio.com/docs.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «perfil ligero documentado con tareas y atajos usados» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta visual studio code con Git, Python/Java, testing y productividad; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «configurar un flujo de trabajo repetible para estudiar y depurar» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «perfil ligero documentado con tareas y atajos usados».

**Criterio de salida:** entrega «perfil ligero documentado con tareas y atajos usados», explica «instalar extensiones indiscriminadamente o versionar secretos de settings» y demuestra cómo visual studio code se conecta con Git, Python/Java, testing y productividad.

**Fuentes primarias para iniciar:** code.visualstudio.com/docs.

## Tema 64: Windows: WinUtil

**Meta:** registro de cambios, estado antes/después y procedimiento de reversión

**Contexto de práctica:** evaluar ajustes de Windows sin desactivar controles críticos a ciegas

**Conocimientos que conecta:** seguridad, sistemas operativos y operación

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «evaluar ajustes de Windows sin desactivar controles críticos a ciegas» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: registro de cambios, estado antes/después y procedimiento de reversión.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar windows: winutil.
- [ ] **Paso 4.** Define un glosario propio para las piezas de PowerShell, telemetría, servicios, privacidad, rendimiento, snapshots y reversibilidad.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de PowerShell, telemetría, servicios, privacidad, rendimiento, snapshots y reversibilidad antes de memorizar términos.
- [ ] **Paso 6.** Prepara WinUtil oficial en VM o máquina de prueba respaldada; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en repositorio oficial de WinUtil y Microsoft Learn PowerShell una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «evaluar ajustes de Windows sin desactivar controles críticos a ciegas» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «leer el script, revisar diff de ajustes y probar restore point antes del cambio» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «ejecutar scripts elevados sin inspeccionar origen, alcance ni rollback» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de PowerShell, telemetría, servicios, privacidad, rendimiento, snapshots y reversibilidad y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «evaluar ajustes de Windows sin desactivar controles críticos a ciegas» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de windows: winutil.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a PowerShell, telemetría, servicios, privacidad, rendimiento, snapshots y reversibilidad.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «registro de cambios, estado antes/después y procedimiento de reversión».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en repositorio oficial de WinUtil y Microsoft Learn PowerShell.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «registro de cambios, estado antes/después y procedimiento de reversión» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta windows: winutil con seguridad, sistemas operativos y operación; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «evaluar ajustes de Windows sin desactivar controles críticos a ciegas» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «registro de cambios, estado antes/después y procedimiento de reversión».

**Criterio de salida:** entrega «registro de cambios, estado antes/después y procedimiento de reversión», explica «ejecutar scripts elevados sin inspeccionar origen, alcance ni rollback» y demuestra cómo windows: winutil se conecta con seguridad, sistemas operativos y operación.

**Fuentes primarias para iniciar:** repositorio oficial de WinUtil y Microsoft Learn PowerShell.

## Tema 65: Manim y ManimGX

**Meta:** archivo ejecutable, comando de render y salida revisada

**Contexto de práctica:** explicar visualmente un concepto mediante una escena reproducible

**Conocimientos que conecta:** matemáticas, algoritmos y comunicación técnica

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «explicar visualmente un concepto mediante una escena reproducible» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: archivo ejecutable, comando de render y salida revisada.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar manim y manimgx.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Scene, mobjects, transformaciones, texto, color, timing y diferencias entre CE/GX.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Scene, mobjects, transformaciones, texto, color, timing y diferencias entre CE/GX antes de memorizar términos.
- [ ] **Paso 6.** Prepara Python compatible y Manim CE o ManimGX según versión; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.manim.community y manimgx.academa.ai una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «explicar visualmente un concepto mediante una escena reproducible» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «renderizar una transformación con una escena mínima y un concepto medible» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «inventar APIs o asegurar compatibilidad sin renderizar en la versión objetivo» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Scene, mobjects, transformaciones, texto, color, timing y diferencias entre CE/GX y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «explicar visualmente un concepto mediante una escena reproducible» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de manim y manimgx.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Scene, mobjects, transformaciones, texto, color, timing y diferencias entre CE/GX.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «archivo ejecutable, comando de render y salida revisada».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.manim.community y manimgx.academa.ai.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «archivo ejecutable, comando de render y salida revisada» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta manim y manimgx con matemáticas, algoritmos y comunicación técnica; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «explicar visualmente un concepto mediante una escena reproducible» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «archivo ejecutable, comando de render y salida revisada».

**Criterio de salida:** entrega «archivo ejecutable, comando de render y salida revisada», explica «inventar APIs o asegurar compatibilidad sin renderizar en la versión objetivo» y demuestra cómo manim y manimgx se conecta con matemáticas, algoritmos y comunicación técnica.

**Fuentes primarias para iniciar:** docs.manim.community y manimgx.academa.ai.
