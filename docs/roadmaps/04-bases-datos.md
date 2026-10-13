# Bloque 4: Bases de datos

Este bloque contiene 4 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 24: SQL y bases de datos relacionales

**Meta:** esquema normalizado, consultas explicadas y plan de ejecución registrado

**Contexto de práctica:** consultar pedidos, clientes, pagos y paquetes sin duplicar datos

**Conocimientos que conecta:** persistencia JPA, transacciones y consultas de API

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «consultar pedidos, clientes, pagos y paquetes sin duplicar datos» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: esquema normalizado, consultas explicadas y plan de ejecución registrado.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar sql y bases de datos relacionales.
- [ ] **Paso 4.** Define un glosario propio para las piezas de SELECT, JOIN, GROUP BY, subconsultas, índices y normalización.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de SELECT, JOIN, GROUP BY, subconsultas, índices y normalización antes de memorizar términos.
- [ ] **Paso 6.** Prepara PostgreSQL o MySQL en contenedor local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en postgresql.org/docs/current/tutorial-sql.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «consultar pedidos, clientes, pagos y paquetes sin duplicar datos» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «modelar el esquema y comparar un JOIN con consultas separadas» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «usar SELECT * y añadir índices sin medir escritura ni selectividad» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de SELECT, JOIN, GROUP BY, subconsultas, índices y normalización y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «consultar pedidos, clientes, pagos y paquetes sin duplicar datos» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de sql y bases de datos relacionales.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a SELECT, JOIN, GROUP BY, subconsultas, índices y normalización.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «esquema normalizado, consultas explicadas y plan de ejecución registrado».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en postgresql.org/docs/current/tutorial-sql.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «esquema normalizado, consultas explicadas y plan de ejecución registrado» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta sql y bases de datos relacionales con persistencia JPA, transacciones y consultas de API; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «consultar pedidos, clientes, pagos y paquetes sin duplicar datos» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «esquema normalizado, consultas explicadas y plan de ejecución registrado».

**Criterio de salida:** entrega «esquema normalizado, consultas explicadas y plan de ejecución registrado», explica «usar SELECT * y añadir índices sin medir escritura ni selectividad» y demuestra cómo sql y bases de datos relacionales se conecta con persistencia JPA, transacciones y consultas de API.

**Fuentes primarias para iniciar:** postgresql.org/docs/current/tutorial-sql.html.

## Tema 25: Datos espaciales con MySQL

**Meta:** consultas espaciales reproducibles con casos dentro/fuera del polígono

**Contexto de práctica:** encontrar centros y entregas dentro de una zona geográfica

**Conocimientos que conecta:** GPS móvil, sensores y modelo de base de datos

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «encontrar centros y entregas dentro de una zona geográfica» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: consultas espaciales reproducibles con casos dentro/fuera del polígono.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar datos espaciales con mysql.
- [ ] **Paso 4.** Define un glosario propio para las piezas de GEOMETRY, POINT, SRID, índices espaciales y funciones ST_*.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de GEOMETRY, POINT, SRID, índices espaciales y funciones ST_* antes de memorizar términos.
- [ ] **Paso 6.** Prepara MySQL con soporte espacial y dataset sintético; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en dev.mysql.com/doc/refman/8.4/en/spatial-types.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «encontrar centros y entregas dentro de una zona geográfica» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «insertar puntos con SRID explícito y comprobar distancia/intersección» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «mezclar SRIDs, unidades angulares y metros o invertir latitud/longitud» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de GEOMETRY, POINT, SRID, índices espaciales y funciones ST_* y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «encontrar centros y entregas dentro de una zona geográfica» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de datos espaciales con mysql.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a GEOMETRY, POINT, SRID, índices espaciales y funciones ST_*.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «consultas espaciales reproducibles con casos dentro/fuera del polígono».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en dev.mysql.com/doc/refman/8.4/en/spatial-types.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «consultas espaciales reproducibles con casos dentro/fuera del polígono» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta datos espaciales con mysql con GPS móvil, sensores y modelo de base de datos; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «encontrar centros y entregas dentro de una zona geográfica» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «consultas espaciales reproducibles con casos dentro/fuera del polígono».

**Criterio de salida:** entrega «consultas espaciales reproducibles con casos dentro/fuera del polígono», explica «mezclar SRIDs, unidades angulares y metros o invertir latitud/longitud» y demuestra cómo datos espaciales con mysql se conecta con GPS móvil, sensores y modelo de base de datos.

**Fuentes primarias para iniciar:** dev.mysql.com/doc/refman/8.4/en/spatial-types.html.

## Tema 26: PostgreSQL

**Meta:** runbook de backup/restore con evidencia de integridad

**Contexto de práctica:** operar datos de entrega con copias verificables

**Conocimientos que conecta:** SQL, despliegue, permisos y confiabilidad

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «operar datos de entrega con copias verificables» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: runbook de backup/restore con evidencia de integridad.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar postgresql.
- [ ] **Paso 4.** Define un glosario propio para las piezas de esquemas, roles, backup lógico/físico, restauración y extensiones.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de esquemas, roles, backup lógico/físico, restauración y extensiones antes de memorizar términos.
- [ ] **Paso 6.** Prepara psql, pg_dump y contenedor PostgreSQL; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en postgresql.org/docs/current/backup.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «operar datos de entrega con copias verificables» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «restaurar en una base vacía y comparar conteos y restricciones» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confundir que un dump se generó con que el backup es restaurable» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de esquemas, roles, backup lógico/físico, restauración y extensiones y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «operar datos de entrega con copias verificables» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de postgresql.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a esquemas, roles, backup lógico/físico, restauración y extensiones.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «runbook de backup/restore con evidencia de integridad».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en postgresql.org/docs/current/backup.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «runbook de backup/restore con evidencia de integridad» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta postgresql con SQL, despliegue, permisos y confiabilidad; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «operar datos de entrega con copias verificables» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «runbook de backup/restore con evidencia de integridad».

**Criterio de salida:** entrega «runbook de backup/restore con evidencia de integridad», explica «confundir que un dump se generó con que el backup es restaurable» y demuestra cómo postgresql se conecta con SQL, despliegue, permisos y confiabilidad.

**Fuentes primarias para iniciar:** postgresql.org/docs/current/backup.html.

## Tema 27: NoSQL con MongoDB

**Meta:** ADR SQL/NoSQL basado en consultas, integridad y evolución

**Contexto de práctica:** guardar documentos de tracking cuyo patrón de lectura cambia

**Conocimientos que conecta:** modelado relacional, eventos y consistencia

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «guardar documentos de tracking cuyo patrón de lectura cambia» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: ADR SQL/NoSQL basado en consultas, integridad y evolución.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar nosql con mongodb.
- [ ] **Paso 4.** Define un glosario propio para las piezas de documentos, índices, consistencia y criterios NoSQL frente a SQL.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de documentos, índices, consistencia y criterios NoSQL frente a SQL antes de memorizar términos.
- [ ] **Paso 6.** Prepara MongoDB local y mongosh; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en mongodb.com/docs/manual/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «guardar documentos de tracking cuyo patrón de lectura cambia» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «modelar el mismo caso en documentos y relacional y comparar consultas» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «elegir NoSQL por moda o duplicar datos sin estrategia de actualización» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de documentos, índices, consistencia y criterios NoSQL frente a SQL y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «guardar documentos de tracking cuyo patrón de lectura cambia» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de nosql con mongodb.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a documentos, índices, consistencia y criterios NoSQL frente a SQL.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «ADR SQL/NoSQL basado en consultas, integridad y evolución».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en mongodb.com/docs/manual/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «ADR SQL/NoSQL basado en consultas, integridad y evolución» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta nosql con mongodb con modelado relacional, eventos y consistencia; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «guardar documentos de tracking cuyo patrón de lectura cambia» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «ADR SQL/NoSQL basado en consultas, integridad y evolución».

**Criterio de salida:** entrega «ADR SQL/NoSQL basado en consultas, integridad y evolución», explica «elegir NoSQL por moda o duplicar datos sin estrategia de actualización» y demuestra cómo nosql con mongodb se conecta con modelado relacional, eventos y consistencia.

**Fuentes primarias para iniciar:** mongodb.com/docs/manual/.
