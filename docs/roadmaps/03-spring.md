# Bloque 3: Spring y arquitectura de backend

Este bloque contiene 12 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 9: Spring — Fundamentos

**Meta:** app Spring Boot mínima con configuración tipada y pruebas de contexto

**Contexto de práctica:** ensamblar un servicio de pedidos con dependencias inyectadas

**Conocimientos que conecta:** Java, interfaces, REST y persistencia

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «ensamblar un servicio de pedidos con dependencias inyectadas» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: app Spring Boot mínima con configuración tipada y pruebas de contexto.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — fundamentos.
- [ ] **Paso 4.** Define un glosario propio para las piezas de IoC/DI, Beans, ApplicationContext, stereotype annotations, autoconfiguración, starters y configuration files.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de IoC/DI, Beans, ApplicationContext, stereotype annotations, autoconfiguración, starters y configuration files antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Initializr, Maven y Spring Boot; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-framework/reference/core/beans.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «ensamblar un servicio de pedidos con dependencias inyectadas» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «crear beans y probar inyección por constructor y condiciones de autoconfiguración» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confundir anotaciones con arquitectura o inyectar por campo por defecto» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de IoC/DI, Beans, ApplicationContext, stereotype annotations, autoconfiguración, starters y configuration files y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «ensamblar un servicio de pedidos con dependencias inyectadas» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — fundamentos.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a IoC/DI, Beans, ApplicationContext, stereotype annotations, autoconfiguración, starters y configuration files.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «app Spring Boot mínima con configuración tipada y pruebas de contexto».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-framework/reference/core/beans.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «app Spring Boot mínima con configuración tipada y pruebas de contexto» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — fundamentos con Java, interfaces, REST y persistencia; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «ensamblar un servicio de pedidos con dependencias inyectadas» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «app Spring Boot mínima con configuración tipada y pruebas de contexto».

**Criterio de salida:** entrega «app Spring Boot mínima con configuración tipada y pruebas de contexto», explica «confundir anotaciones con arquitectura o inyectar por campo por defecto» y demuestra cómo spring — fundamentos se conecta con Java, interfaces, REST y persistencia.

**Fuentes primarias para iniciar:** docs.spring.io/spring-framework/reference/core/beans.html.

## Tema 10: Spring — Estructura enterprise

**Meta:** feature vertical con dominio puro, puerto y adaptador reemplazable

**Contexto de práctica:** organizar un flujo de compra que permita cambiar adaptadores sin filtrar framework al dominio

**Conocimientos que conecta:** POO, SOLID, Spring DI y microservicios

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «organizar un flujo de compra que permita cambiar adaptadores sin filtrar framework al dominio» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: feature vertical con dominio puro, puerto y adaptador reemplazable.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — estructura enterprise.
- [ ] **Paso 4.** Define un glosario propio para las piezas de domain/application/infrastructure/api/shared, entidades y puertos, usecases, DTO/mappers, adapters, Clean Architecture, DDD y Hexagonal.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de domain/application/infrastructure/api/shared, entidades y puertos, usecases, DTO/mappers, adapters, Clean Architecture, DDD y Hexagonal antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Boot, Maven y diagramas C4; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-modulith/reference/; martinfowler.com/bliki/HexagonalArchitecture.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «organizar un flujo de compra que permita cambiar adaptadores sin filtrar framework al dominio» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «trazar dependencias y probar un use case sin inicializar Spring» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «crear carpetas domain sin respetar dirección de dependencias» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de domain/application/infrastructure/api/shared, entidades y puertos, usecases, DTO/mappers, adapters, Clean Architecture, DDD y Hexagonal y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «organizar un flujo de compra que permita cambiar adaptadores sin filtrar framework al dominio» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — estructura enterprise.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a domain/application/infrastructure/api/shared, entidades y puertos, usecases, DTO/mappers, adapters, Clean Architecture, DDD y Hexagonal.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «feature vertical con dominio puro, puerto y adaptador reemplazable».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-modulith/reference/; martinfowler.com/bliki/HexagonalArchitecture.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «feature vertical con dominio puro, puerto y adaptador reemplazable» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — estructura enterprise con POO, SOLID, Spring DI y microservicios; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «organizar un flujo de compra que permita cambiar adaptadores sin filtrar framework al dominio» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «feature vertical con dominio puro, puerto y adaptador reemplazable».

**Criterio de salida:** entrega «feature vertical con dominio puro, puerto y adaptador reemplazable», explica «crear carpetas domain sin respetar dirección de dependencias» y demuestra cómo spring — estructura enterprise se conecta con POO, SOLID, Spring DI y microservicios.

**Fuentes primarias para iniciar:** docs.spring.io/spring-modulith/reference/; martinfowler.com/bliki/HexagonalArchitecture.html.

## Tema 11: Spring — APIs REST

**Meta:** API versionada con pruebas de contrato, validación y errores consistentes

**Contexto de práctica:** exponer pedidos a web, Android e iOS con contratos estables

**Conocimientos que conecta:** HTTP, seguridad, JPA y QA automation

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «exponer pedidos a web, Android e iOS con contratos estables» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: API versionada con pruebas de contrato, validación y errores consistentes.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — apis rest.
- [ ] **Paso 4.** Define un glosario propio para las piezas de HTTP verbs/status, mappings, path/body/query, DTO/entity, validation, advice y versioning.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de HTTP verbs/status, mappings, path/body/query, DTO/entity, validation, advice y versioning antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Web, Bean Validation y curl; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-framework/reference/web/webmvc.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «exponer pedidos a web, Android e iOS con contratos estables» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «crear endpoint idempotente con validación y contrato de error» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «devolver entidades JPA o responder 200 a todos los resultados» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de HTTP verbs/status, mappings, path/body/query, DTO/entity, validation, advice y versioning y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «exponer pedidos a web, Android e iOS con contratos estables» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — apis rest.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a HTTP verbs/status, mappings, path/body/query, DTO/entity, validation, advice y versioning.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «API versionada con pruebas de contrato, validación y errores consistentes».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-framework/reference/web/webmvc.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «API versionada con pruebas de contrato, validación y errores consistentes» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — apis rest con HTTP, seguridad, JPA y QA automation; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «exponer pedidos a web, Android e iOS con contratos estables» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «API versionada con pruebas de contrato, validación y errores consistentes».

**Criterio de salida:** entrega «API versionada con pruebas de contrato, validación y errores consistentes», explica «devolver entidades JPA o responder 200 a todos los resultados» y demuestra cómo spring — apis rest se conecta con HTTP, seguridad, JPA y QA automation.

**Fuentes primarias para iniciar:** docs.spring.io/spring-framework/reference/web/webmvc.html.

## Tema 12: Spring — Acceso a datos (JPA/Hibernate)

**Meta:** API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso

**Contexto de práctica:** cargar pedidos y líneas de pedido midiendo exactamente el SQL generado

**Conocimientos que conecta:** modelado SQL, REST, transacciones y rendimiento

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «cargar pedidos y líneas de pedido midiendo exactamente el SQL generado» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — acceso a datos (jpa/hibernate).
- [ ] **Paso 4.** Define un glosario propio para las piezas de entities/IDs/relations, LAZY/EAGER, N+1, fetch joins/EntityGraph, cascades/orphan removal, transaction, repositories/query methods y migrations.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de entities/IDs/relations, LAZY/EAGER, N+1, fetch joins/EntityGraph, cascades/orphan removal, transaction, repositories/query methods y migrations antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Data JPA, PostgreSQL, Flyway y SQL logging; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-data/jpa/reference/ y jakarta.ee/specifications/persistence/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «cargar pedidos y líneas de pedido midiendo exactamente el SQL generado» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «reproducir N+1 con fixture real, contar consultas y comparar planes LAZY/EAGER» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «cambiar todo a EAGER, serializar entidades o asumir que LAZY siempre evita consultas» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de entities/IDs/relations, LAZY/EAGER, N+1, fetch joins/EntityGraph, cascades/orphan removal, transaction, repositories/query methods y migrations y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «cargar pedidos y líneas de pedido midiendo exactamente el SQL generado» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — acceso a datos (jpa/hibernate).
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a entities/IDs/relations, LAZY/EAGER, N+1, fetch joins/EntityGraph, cascades/orphan removal, transaction, repositories/query methods y migrations.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-data/jpa/reference/ y jakarta.ee/specifications/persistence/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — acceso a datos (jpa/hibernate) con modelado SQL, REST, transacciones y rendimiento; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «cargar pedidos y líneas de pedido midiendo exactamente el SQL generado» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso».

**Criterio de salida:** entrega «API JPA con migración versionada, caso N+1 medido y fetch plan explícito por caso de uso», explica «cambiar todo a EAGER, serializar entidades o asumir que LAZY siempre evita consultas» y demuestra cómo spring — acceso a datos (jpa/hibernate) se conecta con modelado SQL, REST, transacciones y rendimiento.

**Fuentes primarias para iniciar:** docs.spring.io/spring-data/jpa/reference/ y jakarta.ee/specifications/persistence/.

## Tema 13: Spring — Seguridad

**Meta:** API con matriz de roles y login local IdP documentado

**Contexto de práctica:** autorizar a cliente y operador sin confiar en datos enviados por el cliente

**Conocimientos que conecta:** identidad, HTTP, secretos y zero trust

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «autorizar a cliente y operador sin confiar en datos enviados por el cliente» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: API con matriz de roles y login local IdP documentado.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — seguridad.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Spring Security, JWT header/payload/signature, HMAC/RSA, login/token/filter, roles, OAuth2/OIDC, Keycloak, CORS y Cognito comparison.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Spring Security, JWT header/payload/signature, HMAC/RSA, login/token/filter, roles, OAuth2/OIDC, Keycloak, CORS y Cognito comparison antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Security Test y Keycloak local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-security/reference/ y keycloak.org/documentation una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «autorizar a cliente y operador sin confiar en datos enviados por el cliente» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «verificar firma, issuer, audience, expiry y permisos con pruebas de autorización negativa» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confiar en claims sin validar firma o tratar OAuth2 y OIDC como sinónimos» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Spring Security, JWT header/payload/signature, HMAC/RSA, login/token/filter, roles, OAuth2/OIDC, Keycloak, CORS y Cognito comparison y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «autorizar a cliente y operador sin confiar en datos enviados por el cliente» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — seguridad.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Spring Security, JWT header/payload/signature, HMAC/RSA, login/token/filter, roles, OAuth2/OIDC, Keycloak, CORS y Cognito comparison.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «API con matriz de roles y login local IdP documentado».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-security/reference/ y keycloak.org/documentation.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «API con matriz de roles y login local IdP documentado» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — seguridad con identidad, HTTP, secretos y zero trust; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «autorizar a cliente y operador sin confiar en datos enviados por el cliente» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «API con matriz de roles y login local IdP documentado».

**Criterio de salida:** entrega «API con matriz de roles y login local IdP documentado», explica «confiar en claims sin validar firma o tratar OAuth2 y OIDC como sinónimos» y demuestra cómo spring — seguridad se conecta con identidad, HTTP, secretos y zero trust.

**Fuentes primarias para iniciar:** docs.spring.io/spring-security/reference/ y keycloak.org/documentation.

## Tema 14: Spring — Servicios avanzados

**Meta:** servicios de aplicación con scheduler, listener, cache y email reemplazables en tests

**Contexto de práctica:** ejecutar tareas programadas, reaccionar a cambios y evitar cálculos repetidos

**Conocimientos que conecta:** transacciones, idempotencia, Batch y observabilidad

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «ejecutar tareas programadas, reaccionar a cambios y evitar cálculos repetidos» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: servicios de aplicación con scheduler, listener, cache y email reemplazables en tests.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — servicios avanzados.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Scheduling, ApplicationEvent/@EventListener, Batch, cache y email.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Scheduling, ApplicationEvent/@EventListener, Batch, cache y email antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Boot, scheduler controlable, cache test y mail sink local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-framework/reference/integration.html; docs.spring.io/spring-batch/reference/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «ejecutar tareas programadas, reaccionar a cambios y evitar cálculos repetidos» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «implementar tarea idempotente y evento de dominio comprobable con fake clock» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «publicar emails duplicados o usar cache sin política de invalidación» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Scheduling, ApplicationEvent/@EventListener, Batch, cache y email y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «ejecutar tareas programadas, reaccionar a cambios y evitar cálculos repetidos» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — servicios avanzados.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Scheduling, ApplicationEvent/@EventListener, Batch, cache y email.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «servicios de aplicación con scheduler, listener, cache y email reemplazables en tests».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-framework/reference/integration.html; docs.spring.io/spring-batch/reference/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «servicios de aplicación con scheduler, listener, cache y email reemplazables en tests» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — servicios avanzados con transacciones, idempotencia, Batch y observabilidad; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «ejecutar tareas programadas, reaccionar a cambios y evitar cálculos repetidos» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «servicios de aplicación con scheduler, listener, cache y email reemplazables en tests».

**Criterio de salida:** entrega «servicios de aplicación con scheduler, listener, cache y email reemplazables en tests», explica «publicar emails duplicados o usar cache sin política de invalidación» y demuestra cómo spring — servicios avanzados se conecta con transacciones, idempotencia, Batch y observabilidad.

**Fuentes primarias para iniciar:** docs.spring.io/spring-framework/reference/integration.html; docs.spring.io/spring-batch/reference/.

## Tema 15: Spring — Integración y APIs externas

**Meta:** adaptador externo con timeout, mapping de errores y tests contractuales

**Contexto de práctica:** consultar transportistas y manejar latencia, errores y cambios de contrato

**Conocimientos que conecta:** REST, microservicios, resiliencia y secretos

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «consultar transportistas y manejar latencia, errores y cambios de contrato» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: adaptador externo con timeout, mapping de errores y tests contractuales.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — integración y apis externas.
- [ ] **Paso 4.** Define un glosario propio para las piezas de RestTemplate legado, WebClient, Feign, APIs externas y llamadas entre servicios.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de RestTemplate legado, WebClient, Feign, APIs externas y llamadas entre servicios antes de memorizar términos.
- [ ] **Paso 6.** Prepara WebClient/HTTP Interface/Feign según versión Spring objetivo, WireMock; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-framework/reference/integration/rest-clients.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «consultar transportistas y manejar latencia, errores y cambios de contrato» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «simular timeout, 429 y respuesta inválida sin llamar un tercero real» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «reintentar POST no idempotente o confundir cliente HTTP bloqueante con reactivo» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de RestTemplate legado, WebClient, Feign, APIs externas y llamadas entre servicios y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «consultar transportistas y manejar latencia, errores y cambios de contrato» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — integración y apis externas.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a RestTemplate legado, WebClient, Feign, APIs externas y llamadas entre servicios.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «adaptador externo con timeout, mapping de errores y tests contractuales».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-framework/reference/integration/rest-clients.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «adaptador externo con timeout, mapping de errores y tests contractuales» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — integración y apis externas con REST, microservicios, resiliencia y secretos; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «consultar transportistas y manejar latencia, errores y cambios de contrato» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «adaptador externo con timeout, mapping de errores y tests contractuales».

**Criterio de salida:** entrega «adaptador externo con timeout, mapping de errores y tests contractuales», explica «reintentar POST no idempotente o confundir cliente HTTP bloqueante con reactivo» y demuestra cómo spring — integración y apis externas se conecta con REST, microservicios, resiliencia y secretos.

**Fuentes primarias para iniciar:** docs.spring.io/spring-framework/reference/integration/rest-clients.html.

## Tema 16: Spring — Monitoreo y observabilidad

**Meta:** dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción

**Contexto de práctica:** diagnosticar un retraso que cruza API, base de datos y broker

**Conocimientos que conecta:** microservicios, Kafka, Kubernetes y respuesta a incidentes

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «diagnosticar un retraso que cruza API, base de datos y broker» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — monitoreo y observabilidad.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Actuator, Prometheus/Grafana, ELK, Sentry, logs, métricas y trazas.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Actuator, Prometheus/Grafana, ELK, Sentry, logs, métricas y trazas antes de memorizar términos.
- [ ] **Paso 6.** Prepara Micrometer, OpenTelemetry, Prometheus/Grafana local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-boot/reference/actuator/; opentelemetry.io/docs/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «diagnosticar un retraso que cruza API, base de datos y broker» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «propagar trace/correlation ID y conectar un span HTTP a una dependencia lenta» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «registrar tokens/PII o confundir logs con trazas distribuidas» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Actuator, Prometheus/Grafana, ELK, Sentry, logs, métricas y trazas y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «diagnosticar un retraso que cruza API, base de datos y broker» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — monitoreo y observabilidad.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Actuator, Prometheus/Grafana, ELK, Sentry, logs, métricas y trazas.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-boot/reference/actuator/; opentelemetry.io/docs/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — monitoreo y observabilidad con microservicios, Kafka, Kubernetes y respuesta a incidentes; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «diagnosticar un retraso que cruza API, base de datos y broker» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción».

**Criterio de salida:** entrega «dashboard mínimo con SLI definidos, trazas correlacionadas y política de redacción», explica «registrar tokens/PII o confundir logs con trazas distribuidas» y demuestra cómo spring — monitoreo y observabilidad se conecta con microservicios, Kafka, Kubernetes y respuesta a incidentes.

**Fuentes primarias para iniciar:** docs.spring.io/spring-boot/reference/actuator/; opentelemetry.io/docs/.

## Tema 17: Spring — Ecosistema y milestones

**Meta:** ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback

**Contexto de práctica:** evaluar una actualización del ecosistema sin desplegar una milestone accidentalmente

**Conocimientos que conecta:** Maven, Spring Boot, seguridad de cadena de suministro

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «evaluar una actualización del ecosistema sin desplegar una milestone accidentalmente» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring — ecosistema y milestones.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Spring AI/Data/Security/Integration/AMQP/Cloud, SemVer/prerelease, BOM y compatibilidad.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Spring AI/Data/Security/Integration/AMQP/Cloud, SemVer/prerelease, BOM y compatibilidad antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Initializr, Maven dependency tree, release notes oficiales; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en spring.io/projects; github.com/spring-projects una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «evaluar una actualización del ecosistema sin desplegar una milestone accidentalmente» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «comprobar coordenada, estado GA/RC/M y compatibilidad antes de habilitar un BOM» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «copiar números de milestone del cuaderno como versiones estables o ignorar compatibilidad» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Spring AI/Data/Security/Integration/AMQP/Cloud, SemVer/prerelease, BOM y compatibilidad y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «evaluar una actualización del ecosistema sin desplegar una milestone accidentalmente» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring — ecosistema y milestones.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Spring AI/Data/Security/Integration/AMQP/Cloud, SemVer/prerelease, BOM y compatibilidad.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en spring.io/projects; github.com/spring-projects.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring — ecosistema y milestones con Maven, Spring Boot, seguridad de cadena de suministro; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «evaluar una actualización del ecosistema sin desplegar una milestone accidentalmente» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback».

**Criterio de salida:** entrega «ADR de upgrade con fuentes fechadas, dependency tree y plan de rollback», explica «copiar números de milestone del cuaderno como versiones estables o ignorar compatibilidad» y demuestra cómo spring — ecosistema y milestones se conecta con Maven, Spring Boot, seguridad de cadena de suministro.

**Fuentes primarias para iniciar:** spring.io/projects; github.com/spring-projects.

## Tema 18: Spring Batch

**Meta:** job con restart comprobado, métrica por chunk y política de errores

**Contexto de práctica:** conciliar millones de eventos reiniciando tras una falla

**Conocimientos que conecta:** base de datos, transacciones, scheduler y operación

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «conciliar millones de eventos reiniciando tras una falla» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: job con restart comprobado, métrica por chunk y política de errores.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring batch.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Job/Step/JobRepository, chunk, reader/processor/writer, skip, retry, restart, partitioning y parallelism.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Job/Step/JobRepository, chunk, reader/processor/writer, skip, retry, restart, partitioning y parallelism antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Batch, PostgreSQL y dataset sintético; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-batch/reference/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «conciliar millones de eventos reiniciando tras una falla» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «fallar entre chunks, reanudar y probar idempotencia de escrituras» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «procesar todo en memoria o llamar restartable a un job con efectos duplicables» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Job/Step/JobRepository, chunk, reader/processor/writer, skip, retry, restart, partitioning y parallelism y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «conciliar millones de eventos reiniciando tras una falla» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring batch.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Job/Step/JobRepository, chunk, reader/processor/writer, skip, retry, restart, partitioning y parallelism.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «job con restart comprobado, métrica por chunk y política de errores».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-batch/reference/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «job con restart comprobado, métrica por chunk y política de errores» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring batch con base de datos, transacciones, scheduler y operación; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «conciliar millones de eventos reiniciando tras una falla» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «job con restart comprobado, métrica por chunk y política de errores».

**Criterio de salida:** entrega «job con restart comprobado, métrica por chunk y política de errores», explica «procesar todo en memoria o llamar restartable a un job con efectos duplicables» y demuestra cómo spring batch se conecta con base de datos, transacciones, scheduler y operación.

**Fuentes primarias para iniciar:** docs.spring.io/spring-batch/reference/.

## Tema 19: Arquitectura de microservicios

**Meta:** ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios

**Contexto de práctica:** decidir si separar pedidos de facturación o mantener un monolito modular

**Conocimientos que conecta:** DDD, REST, Kafka, Saga, CQRS y Outbox

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «decidir si separar pedidos de facturación o mantener un monolito modular» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar arquitectura de microservicios.
- [ ] **Paso 4.** Define un glosario propio para las piezas de monolith comparison, bounded contexts, gateway, sync/async, circuit breaker, bulkhead, observability, DB-per-service, deployment, Saga.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de monolith comparison, bounded contexts, gateway, sync/async, circuit breaker, bulkhead, observability, DB-per-service, deployment, Saga antes de memorizar términos.
- [ ] **Paso 6.** Prepara diagramas C4, Spring Cloud y broker local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en microservices.io y docs.spring.io/spring-cloud/reference/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «decidir si separar pedidos de facturación o mantener un monolito modular» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «mapear fallos y costes operativos antes de separar un bounded context» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «llamar microservicio a cualquier Spring Boot con REST y Docker» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de monolith comparison, bounded contexts, gateway, sync/async, circuit breaker, bulkhead, observability, DB-per-service, deployment, Saga y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «decidir si separar pedidos de facturación o mantener un monolito modular» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de arquitectura de microservicios.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a monolith comparison, bounded contexts, gateway, sync/async, circuit breaker, bulkhead, observability, DB-per-service, deployment, Saga.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en microservices.io y docs.spring.io/spring-cloud/reference/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta arquitectura de microservicios con DDD, REST, Kafka, Saga, CQRS y Outbox; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «decidir si separar pedidos de facturación o mantener un monolito modular» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios».

**Criterio de salida:** entrega «ADR que demuestra por qué Spring Boot + REST + Docker no es criterio suficiente para microservicios», explica «llamar microservicio a cualquier Spring Boot con REST y Docker» y demuestra cómo arquitectura de microservicios se conecta con DDD, REST, Kafka, Saga, CQRS y Outbox.

**Fuentes primarias para iniciar:** microservices.io y docs.spring.io/spring-cloud/reference/.

## Tema 20: Apache Kafka

**Meta:** flujo probado por partición, idempotent producer y DLT con alerta y replay controlado

**Contexto de práctica:** propagar el estado de paquetes con retries acotados y DLQ operable

**Conocimientos que conecta:** Outbox, microservices, resiliencia y observabilidad

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «propagar el estado de paquetes con retries acotados y DLQ operable» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: flujo probado por partición, idempotent producer y DLT con alerta y replay controlado.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar apache kafka.
- [ ] **Paso 4.** Define un glosario propio para las piezas de broker/topic/partition/offset/group, KafkaTemplate/listener, replication, retries/backoff, DLT/@DltHandler, idempotency y Kafka vs REST.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de broker/topic/partition/offset/group, KafkaTemplate/listener, replication, retries/backoff, DLT/@DltHandler, idempotency y Kafka vs REST antes de memorizar términos.
- [ ] **Paso 6.** Prepara Kafka local, Spring Kafka Test y Docker Compose; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en kafka.apache.org/documentation/ y docs.spring.io/spring-kafka/reference/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «propagar el estado de paquetes con retries acotados y DLQ operable» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «provocar fallo de consumer y seguir offset→retry topic→DLT→replay» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confundir orden global con orden por partición o asumir exactly-once extremo a extremo» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de broker/topic/partition/offset/group, KafkaTemplate/listener, replication, retries/backoff, DLT/@DltHandler, idempotency y Kafka vs REST y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «propagar el estado de paquetes con retries acotados y DLQ operable» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de apache kafka.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a broker/topic/partition/offset/group, KafkaTemplate/listener, replication, retries/backoff, DLT/@DltHandler, idempotency y Kafka vs REST.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «flujo probado por partición, idempotent producer y DLT con alerta y replay controlado».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en kafka.apache.org/documentation/ y docs.spring.io/spring-kafka/reference/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «flujo probado por partición, idempotent producer y DLT con alerta y replay controlado» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta apache kafka con Outbox, microservices, resiliencia y observabilidad; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «propagar el estado de paquetes con retries acotados y DLQ operable» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «flujo probado por partición, idempotent producer y DLT con alerta y replay controlado».

**Criterio de salida:** entrega «flujo probado por partición, idempotent producer y DLT con alerta y replay controlado», explica «confundir orden global con orden por partición o asumir exactly-once extremo a extremo» y demuestra cómo apache kafka se conecta con Outbox, microservices, resiliencia y observabilidad.

**Fuentes primarias para iniciar:** kafka.apache.org/documentation/ y docs.spring.io/spring-kafka/reference/.
