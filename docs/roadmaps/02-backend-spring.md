# Bloque 2: Backend con Java y Spring

Este bloque contiene 8 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 10: Fundamentos de Spring y Spring Boot

**Meta:** servicio por capas con dependencias explícitas y test aislado

**Contexto de práctica:** ensamblar un servicio de pedidos sin que las clases creen sus dependencias

**Conocimientos que conecta:** Java, interfaces y módulos Maven

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «ensamblar un servicio de pedidos sin que las clases creen sus dependencias» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: servicio por capas con dependencias explícitas y test aislado.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar fundamentos de spring y spring boot.
- [ ] **Paso 4.** Define un glosario propio para las piezas de IoC, DI, beans, ApplicationContext, autoconfiguración y starters.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de IoC, DI, beans, ApplicationContext, autoconfiguración y starters antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Initializr, Maven y Spring Boot; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-framework/reference/core/beans.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «ensamblar un servicio de pedidos sin que las clases creen sus dependencias» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «inyectar una interfaz por constructor y sustituirla en una prueba» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confundir anotaciones con arquitectura o inyectar por campo por defecto» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de IoC, DI, beans, ApplicationContext, autoconfiguración y starters y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «ensamblar un servicio de pedidos sin que las clases creen sus dependencias» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de fundamentos de spring y spring boot.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a IoC, DI, beans, ApplicationContext, autoconfiguración y starters.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «servicio por capas con dependencias explícitas y test aislado».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-framework/reference/core/beans.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «servicio por capas con dependencias explícitas y test aislado» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta fundamentos de spring y spring boot con Java, interfaces y módulos Maven; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «ensamblar un servicio de pedidos sin que las clases creen sus dependencias» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «servicio por capas con dependencias explícitas y test aislado».

**Criterio de salida:** entrega «servicio por capas con dependencias explícitas y test aislado», explica «confundir anotaciones con arquitectura o inyectar por campo por defecto» y demuestra cómo fundamentos de spring y spring boot se conecta con Java, interfaces y módulos Maven.

**Fuentes primarias para iniciar:** docs.spring.io/spring-framework/reference/core/beans.html.

## Tema 11: Spring Boot explicado en nueve capas

**Meta:** mapa de arquitectura con una ruta de petición trazable

**Contexto de práctica:** seguir una petición desde el arranque hasta la observabilidad de producción

**Conocimientos que conecta:** IoC, contratos HTTP, persistencia y operación

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «seguir una petición desde el arranque hasta la observabilidad de producción» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: mapa de arquitectura con una ruta de petición trazable.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring boot explicado en nueve capas.
- [ ] **Paso 4.** Define un glosario propio para las piezas de fundamentos, REST, datos, seguridad, arquitectura, servicios, integración, despliegue y monitoreo.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de fundamentos, REST, datos, seguridad, arquitectura, servicios, integración, despliegue y monitoreo antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Boot, Actuator y Docker local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-boot/reference/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «seguir una petición desde el arranque hasta la observabilidad de producción» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «mapear una funcionalidad a dominio, aplicación, infraestructura y API» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «tratar las capas como carpetas decorativas sin límites de dependencia» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de fundamentos, REST, datos, seguridad, arquitectura, servicios, integración, despliegue y monitoreo y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «seguir una petición desde el arranque hasta la observabilidad de producción» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring boot explicado en nueve capas.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a fundamentos, REST, datos, seguridad, arquitectura, servicios, integración, despliegue y monitoreo.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «mapa de arquitectura con una ruta de petición trazable».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-boot/reference/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «mapa de arquitectura con una ruta de petición trazable» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring boot explicado en nueve capas con IoC, contratos HTTP, persistencia y operación; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «seguir una petición desde el arranque hasta la observabilidad de producción» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «mapa de arquitectura con una ruta de petición trazable».

**Criterio de salida:** entrega «mapa de arquitectura con una ruta de petición trazable», explica «tratar las capas como carpetas decorativas sin límites de dependencia» y demuestra cómo spring boot explicado en nueve capas se conecta con IoC, contratos HTTP, persistencia y operación.

**Fuentes primarias para iniciar:** docs.spring.io/spring-boot/reference/.

## Tema 12: APIs REST con Spring Boot

**Meta:** API documentada con contrato y tests de casos inválidos

**Contexto de práctica:** exponer la creación y consulta de envíos a clientes web y móviles

**Conocimientos que conecta:** HTTP, serialización, seguridad y persistencia

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «exponer la creación y consulta de envíos a clientes web y móviles» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: API documentada con contrato y tests de casos inválidos.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar apis rest con spring boot.
- [ ] **Paso 4.** Define un glosario propio para las piezas de verbos, status codes, DTOs, validación, ControllerAdvice y versionado.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de verbos, status codes, DTOs, validación, ControllerAdvice y versionado antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Web, Bean Validation y curl; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-framework/reference/web/webmvc.html una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «exponer la creación y consulta de envíos a clientes web y móviles» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «implementar POST/GET con validación y errores JSON consistentes» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «devolver entidades JPA o responder 200 a todos los resultados» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de verbos, status codes, DTOs, validación, ControllerAdvice y versionado y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «exponer la creación y consulta de envíos a clientes web y móviles» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de apis rest con spring boot.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a verbos, status codes, DTOs, validación, ControllerAdvice y versionado.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «API documentada con contrato y tests de casos inválidos».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-framework/reference/web/webmvc.html.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «API documentada con contrato y tests de casos inválidos» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta apis rest con spring boot con HTTP, serialización, seguridad y persistencia; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «exponer la creación y consulta de envíos a clientes web y móviles» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «API documentada con contrato y tests de casos inválidos».

**Criterio de salida:** entrega «API documentada con contrato y tests de casos inválidos», explica «devolver entidades JPA o responder 200 a todos los resultados» y demuestra cómo apis rest con spring boot se conecta con HTTP, serialización, seguridad y persistencia.

**Fuentes primarias para iniciar:** docs.spring.io/spring-framework/reference/web/webmvc.html.

## Tema 13: Spring Data JPA e Hibernate

**Meta:** repositorio con migración, SQL observado y plan de fetch probado

**Contexto de práctica:** leer órdenes y sus paquetes sin multiplicar consultas inesperadamente

**Conocimientos que conecta:** modelo de dominio, REST y transacciones

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «leer órdenes y sus paquetes sin multiplicar consultas inesperadamente» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: repositorio con migración, SQL observado y plan de fetch probado.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring data jpa e hibernate.
- [ ] **Paso 4.** Define un glosario propio para las piezas de relaciones, LAZY/EAGER, N+1, cascada, transacciones, query methods y migraciones.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de relaciones, LAZY/EAGER, N+1, cascada, transacciones, query methods y migraciones antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Data JPA, PostgreSQL, Flyway y SQL logging; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-data/jpa/reference/ y jakarta.ee/specifications/persistence/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «leer órdenes y sus paquetes sin multiplicar consultas inesperadamente» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «medir N+1 y comparar LAZY con fetch join o EntityGraph bajo un caso de uso» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «cambiar todo a EAGER, serializar entidades o asumir que LAZY siempre evita consultas» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de relaciones, LAZY/EAGER, N+1, cascada, transacciones, query methods y migraciones y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «leer órdenes y sus paquetes sin multiplicar consultas inesperadamente» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring data jpa e hibernate.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a relaciones, LAZY/EAGER, N+1, cascada, transacciones, query methods y migraciones.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «repositorio con migración, SQL observado y plan de fetch probado».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-data/jpa/reference/ y jakarta.ee/specifications/persistence/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «repositorio con migración, SQL observado y plan de fetch probado» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring data jpa e hibernate con modelo de dominio, REST y transacciones; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «leer órdenes y sus paquetes sin multiplicar consultas inesperadamente» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «repositorio con migración, SQL observado y plan de fetch probado».

**Criterio de salida:** entrega «repositorio con migración, SQL observado y plan de fetch probado», explica «cambiar todo a EAGER, serializar entidades o asumir que LAZY siempre evita consultas» y demuestra cómo spring data jpa e hibernate se conecta con modelo de dominio, REST y transacciones.

**Fuentes primarias para iniciar:** docs.spring.io/spring-data/jpa/reference/ y jakarta.ee/specifications/persistence/.

## Tema 14: Spring Security, JWT, OAuth2, OIDC y Keycloak

**Meta:** API con matriz de permisos y pruebas de acceso/denegación

**Contexto de práctica:** proteger el acceso de operador y cliente a los envíos

**Conocimientos que conecta:** REST, identidad, secretos y límites de confianza

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «proteger el acceso de operador y cliente a los envíos» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: API con matriz de permisos y pruebas de acceso/denegación.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring security, jwt, oauth2, oidc y keycloak.
- [ ] **Paso 4.** Define un glosario propio para las piezas de firma JWT HMAC/RSA, filtros, roles, PreAuthorize, OAuth2, OIDC e IdP.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de firma JWT HMAC/RSA, filtros, roles, PreAuthorize, OAuth2, OIDC e IdP antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Security Test y Keycloak local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-security/reference/ y keycloak.org/documentation una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «proteger el acceso de operador y cliente a los envíos» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «validar issuer, audience, expiración y rol con tokens de prueba» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confiar en claims sin validar firma o tratar OAuth2 y OIDC como sinónimos» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de firma JWT HMAC/RSA, filtros, roles, PreAuthorize, OAuth2, OIDC e IdP y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «proteger el acceso de operador y cliente a los envíos» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring security, jwt, oauth2, oidc y keycloak.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a firma JWT HMAC/RSA, filtros, roles, PreAuthorize, OAuth2, OIDC e IdP.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «API con matriz de permisos y pruebas de acceso/denegación».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-security/reference/ y keycloak.org/documentation.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «API con matriz de permisos y pruebas de acceso/denegación» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring security, jwt, oauth2, oidc y keycloak con REST, identidad, secretos y límites de confianza; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «proteger el acceso de operador y cliente a los envíos» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «API con matriz de permisos y pruebas de acceso/denegación».

**Criterio de salida:** entrega «API con matriz de permisos y pruebas de acceso/denegación», explica «confiar en claims sin validar firma o tratar OAuth2 y OIDC como sinónimos» y demuestra cómo spring security, jwt, oauth2, oidc y keycloak se conecta con REST, identidad, secretos y límites de confianza.

**Fuentes primarias para iniciar:** docs.spring.io/spring-security/reference/ y keycloak.org/documentation.

## Tema 15: Arquitectura de microservicios

**Meta:** ADR con límites de dominio, fallos parciales y estrategia de consistencia

**Contexto de práctica:** separar pedidos y tracking cuando el dominio justifica despliegue independiente

**Conocimientos que conecta:** DDD, APIs, eventos, observabilidad y despliegue

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «separar pedidos y tracking cuando el dominio justifica despliegue independiente» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: ADR con límites de dominio, fallos parciales y estrategia de consistencia.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar arquitectura de microservicios.
- [ ] **Paso 4.** Define un glosario propio para las piezas de bounded contexts, sync/async, gateway, circuit breaker, Saga, CQRS y Outbox.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de bounded contexts, sync/async, gateway, circuit breaker, Saga, CQRS y Outbox antes de memorizar términos.
- [ ] **Paso 6.** Prepara diagramas C4, Spring Cloud y broker local; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en microservices.io y docs.spring.io/spring-cloud/reference/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «separar pedidos y tracking cuando el dominio justifica despliegue independiente» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «contrastar un monolito modular con una división de servicios y justificar el coste operativo» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «llamar microservicio a cualquier Spring Boot con REST y Docker» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de bounded contexts, sync/async, gateway, circuit breaker, Saga, CQRS y Outbox y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «separar pedidos y tracking cuando el dominio justifica despliegue independiente» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de arquitectura de microservicios.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a bounded contexts, sync/async, gateway, circuit breaker, Saga, CQRS y Outbox.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «ADR con límites de dominio, fallos parciales y estrategia de consistencia».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en microservices.io y docs.spring.io/spring-cloud/reference/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «ADR con límites de dominio, fallos parciales y estrategia de consistencia» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta arquitectura de microservicios con DDD, APIs, eventos, observabilidad y despliegue; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «separar pedidos y tracking cuando el dominio justifica despliegue independiente» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «ADR con límites de dominio, fallos parciales y estrategia de consistencia».

**Criterio de salida:** entrega «ADR con límites de dominio, fallos parciales y estrategia de consistencia», explica «llamar microservicio a cualquier Spring Boot con REST y Docker» y demuestra cómo arquitectura de microservicios se conecta con DDD, APIs, eventos, observabilidad y despliegue.

**Fuentes primarias para iniciar:** microservices.io y docs.spring.io/spring-cloud/reference/.

## Tema 16: Apache Kafka con Spring Boot

**Meta:** producer/consumer con clave estable, backoff, DLT y prueba de replay

**Contexto de práctica:** publicar cambios de envío y consumirlos con recuperación de fallos

**Conocimientos que conecta:** eventos de dominio, Outbox, observabilidad y resiliencia

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «publicar cambios de envío y consumirlos con recuperación de fallos» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: producer/consumer con clave estable, backoff, DLT y prueba de replay.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar apache kafka con spring boot.
- [ ] **Paso 4.** Define un glosario propio para las piezas de brokers, topics, partitions, offsets, consumer groups, réplica, retries, DLT e idempotencia.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de brokers, topics, partitions, offsets, consumer groups, réplica, retries, DLT e idempotencia antes de memorizar términos.
- [ ] **Paso 6.** Prepara Kafka local, Spring Kafka Test y Docker Compose; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en kafka.apache.org/documentation/ y docs.spring.io/spring-kafka/reference/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «publicar cambios de envío y consumirlos con recuperación de fallos» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «forzar una excepción, observar retry topic y DLT y procesarla con @DltHandler» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «confundir orden global con orden por partición o asumir exactly-once extremo a extremo» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de brokers, topics, partitions, offsets, consumer groups, réplica, retries, DLT e idempotencia y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «publicar cambios de envío y consumirlos con recuperación de fallos» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de apache kafka con spring boot.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a brokers, topics, partitions, offsets, consumer groups, réplica, retries, DLT e idempotencia.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «producer/consumer con clave estable, backoff, DLT y prueba de replay».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en kafka.apache.org/documentation/ y docs.spring.io/spring-kafka/reference/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «producer/consumer con clave estable, backoff, DLT y prueba de replay» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta apache kafka con spring boot con eventos de dominio, Outbox, observabilidad y resiliencia; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «publicar cambios de envío y consumirlos con recuperación de fallos» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «producer/consumer con clave estable, backoff, DLT y prueba de replay».

**Criterio de salida:** entrega «producer/consumer con clave estable, backoff, DLT y prueba de replay», explica «confundir orden global con orden por partición o asumir exactly-once extremo a extremo» y demuestra cómo apache kafka con spring boot se conecta con eventos de dominio, Outbox, observabilidad y resiliencia.

**Fuentes primarias para iniciar:** kafka.apache.org/documentation/ y docs.spring.io/spring-kafka/reference/.

## Tema 17: Spring Batch

**Meta:** importación chunk-oriented con estado, métricas y política de errores

**Contexto de práctica:** reconciliar cientos de miles de movimientos logísticos reiniciando tras un fallo

**Conocimientos que conecta:** transacciones, persistencia, idempotencia y operaciones

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «reconciliar cientos de miles de movimientos logísticos reiniciando tras un fallo» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: importación chunk-oriented con estado, métricas y política de errores.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar spring batch.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Job, Step, ItemReader/Processor/Writer, chunk, skip/retry, restart, partitioning y JobRepository.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Job, Step, ItemReader/Processor/Writer, chunk, skip/retry, restart, partitioning y JobRepository antes de memorizar términos.
- [ ] **Paso 6.** Prepara Spring Batch, PostgreSQL y dataset sintético; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en docs.spring.io/spring-batch/reference/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «reconciliar cientos de miles de movimientos logísticos reiniciando tras un fallo» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «fallar a mitad de un chunk, reiniciar el Job y probar que no duplica registros» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «procesar todo en memoria o llamar restartable a un job con efectos duplicables» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Job, Step, ItemReader/Processor/Writer, chunk, skip/retry, restart, partitioning y JobRepository y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «reconciliar cientos de miles de movimientos logísticos reiniciando tras un fallo» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de spring batch.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Job, Step, ItemReader/Processor/Writer, chunk, skip/retry, restart, partitioning y JobRepository.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «importación chunk-oriented con estado, métricas y política de errores».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en docs.spring.io/spring-batch/reference/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «importación chunk-oriented con estado, métricas y política de errores» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta spring batch con transacciones, persistencia, idempotencia y operaciones; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «reconciliar cientos de miles de movimientos logísticos reiniciando tras un fallo» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «importación chunk-oriented con estado, métricas y política de errores».

**Criterio de salida:** entrega «importación chunk-oriented con estado, métricas y política de errores», explica «procesar todo en memoria o llamar restartable a un job con efectos duplicables» y demuestra cómo spring batch se conecta con transacciones, persistencia, idempotencia y operaciones.

**Fuentes primarias para iniciar:** docs.spring.io/spring-batch/reference/.
