# Bloque 5: Bases de datos

Este bloque contiene 1 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 27: Bases de datos: SQL, PostgreSQL, MySQL espacial y MongoDB

**Meta:** modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado

**Contexto de práctica:** persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga

**Conocimientos que conecta:** JPA, GPS móvil, integridad, índices y eventos

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar bases de datos: sql, postgresql, mysql espacial y mongodb.
- [ ] **Paso 4.** Define un glosario propio para las piezas de SQL/JOIN/GROUP BY/subqueries/indexes/normalization, Postgres backup/extensions, MySQL GEOMETRY/ST_*, MongoDB and SQL-vs-NoSQL.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de SQL/JOIN/GROUP BY/subqueries/indexes/normalization, Postgres backup/extensions, MySQL GEOMETRY/ST_*, MongoDB and SQL-vs-NoSQL antes de memorizar términos.
- [ ] **Paso 6.** Prepara PostgreSQL o MySQL en contenedor local, MySQL con soporte espacial y dataset sintético, psql, pg_dump y contenedor PostgreSQL, MongoDB local y mongosh; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en postgresql.org/docs/current/tutorial-sql.html; dev.mysql.com/doc/refman/8.4/en/spatial-types.html; postgresql.org/docs/current/backup.html; mongodb.com/docs/manual/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «comparar dos modelos para la misma consulta espacial y verificar un restore» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «usar SELECT * y añadir índices sin medir escritura ni selectividad; mezclar SRIDs, unidades angulares y metros o invertir latitud/longitud; confundir que un dump se generó con que el backup es restaurable; elegir NoSQL por moda o duplicar datos sin estrategia de actualización» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de SQL/JOIN/GROUP BY/subqueries/indexes/normalization, Postgres backup/extensions, MySQL GEOMETRY/ST_*, MongoDB and SQL-vs-NoSQL y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de bases de datos: sql, postgresql, mysql espacial y mongodb.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a SQL/JOIN/GROUP BY/subqueries/indexes/normalization, Postgres backup/extensions, MySQL GEOMETRY/ST_*, MongoDB and SQL-vs-NoSQL.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en postgresql.org/docs/current/tutorial-sql.html; dev.mysql.com/doc/refman/8.4/en/spatial-types.html; postgresql.org/docs/current/backup.html; mongodb.com/docs/manual/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta bases de datos: sql, postgresql, mysql espacial y mongodb con JPA, GPS móvil, integridad, índices y eventos; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «persistir pedidos y localizar entregas por zona sin imponer el mismo modelo a toda carga» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado».

**Criterio de salida:** entrega «modelo relacional migrable, consultas espaciales con SRID y ADR SQL/NoSQL con backup restaurado», explica «usar SELECT * y añadir índices sin medir escritura ni selectividad; mezclar SRIDs, unidades angulares y metros o invertir latitud/longitud; confundir que un dump se generó con que el backup es restaurable; elegir NoSQL por moda o duplicar datos sin estrategia de actualización» y demuestra cómo bases de datos: sql, postgresql, mysql espacial y mongodb se conecta con JPA, GPS móvil, integridad, índices y eventos.

**Fuentes primarias para iniciar:** postgresql.org/docs/current/tutorial-sql.html; dev.mysql.com/doc/refman/8.4/en/spatial-types.html; postgresql.org/docs/current/backup.html; mongodb.com/docs/manual/.
