# Bloque 16: Patrones de diseño y arquitectura

Este bloque contiene 7 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 43: SOLID

**Meta:** diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables

**Contexto de práctica:** cambiar reglas de una plataforma logística sin reescribir su núcleo

**Conocimientos que conecta:** POO, DI, Strategy, Adapter y arquitectura hexagonal

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «cambiar reglas de una plataforma logística sin reescribir su núcleo» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar solid.
- [ ] **Paso 4.** Define un glosario propio para las piezas de SRP, OCP, LSP, ISP y DIP; cada principio con ejemplo incorrecto/correcto y reflejo en Spring.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de SRP, OCP, LSP, ISP y DIP; cada principio con ejemplo incorrecto/correcto y reflejo en Spring antes de memorizar términos.
- [ ] **Paso 6.** Prepara Java 17+, JUnit y estructura Spring; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en objectmentor.com/resources/articles/Principles_and_Patterns.pdf; docs.spring.io; web/public/content/java/modulo-12.md; web/public/content/spring-boot/modulo-15.md una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «cambiar reglas de una plataforma logística sin reescribir su núcleo» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «refactorizar una clase God-like principio por principio y mostrar pruebas antes/después» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «convertir SOLID en receta de interfaces por clase o ignorar el coste de abstracción» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de SRP, OCP, LSP, ISP y DIP; cada principio con ejemplo incorrecto/correcto y reflejo en Spring y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «cambiar reglas de una plataforma logística sin reescribir su núcleo» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de solid.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a SRP, OCP, LSP, ISP y DIP; cada principio con ejemplo incorrecto/correcto y reflejo en Spring.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en objectmentor.com/resources/articles/Principles_and_Patterns.pdf; docs.spring.io; web/public/content/java/modulo-12.md; web/public/content/spring-boot/modulo-15.md.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta solid con POO, DI, Strategy, Adapter y arquitectura hexagonal; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «cambiar reglas de una plataforma logística sin reescribir su núcleo» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables».

**Criterio de salida:** entrega «diagrama y diff de refactorización con ejemplos positivos/negativos ejecutables», explica «convertir SOLID en receta de interfaces por clase o ignorar el coste de abstracción» y demuestra cómo solid se conecta con POO, DI, Strategy, Adapter y arquitectura hexagonal.

**Fuentes primarias para iniciar:** objectmentor.com/resources/articles/Principles_and_Patterns.pdf; docs.spring.io; web/public/content/java/modulo-12.md; web/public/content/spring-boot/modulo-15.md.

## Tema 44: Patrones creacionales

**Meta:** ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales

**Contexto de práctica:** crear notificadores y pedidos válidos para canales y configuraciones variables

**Conocimientos que conecta:** SOLID, inmutabilidad, DI y patrones estructurales

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «crear notificadores y pedidos válidos para canales y configuraciones variables» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar patrones creacionales.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Singleton Eager/Lazy/Synchronized/DCL/Enum, Factory Method, Abstract Factory, Builder y Prototype.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Singleton Eager/Lazy/Synchronized/DCL/Enum, Factory Method, Abstract Factory, Builder y Prototype antes de memorizar términos.
- [ ] **Paso 6.** Prepara Java 17+, JUnit y plantillas Maven; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en refactoring.guru/design-patterns/creational-patterns; examples/java/patrones-rutaflow/CreationalPatternsDemo.java una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «crear notificadores y pedidos válidos para canales y configuraciones variables» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «ejecutar cada variante/fábrica con salida esperada y comparar composición, concurrencia y testabilidad» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «usar Singleton global para estado mutable o construir fábricas sin variación real» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Singleton Eager/Lazy/Synchronized/DCL/Enum, Factory Method, Abstract Factory, Builder y Prototype y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «crear notificadores y pedidos válidos para canales y configuraciones variables» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de patrones creacionales.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Singleton Eager/Lazy/Synchronized/DCL/Enum, Factory Method, Abstract Factory, Builder y Prototype.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en refactoring.guru/design-patterns/creational-patterns; examples/java/patrones-rutaflow/CreationalPatternsDemo.java.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta patrones creacionales con SOLID, inmutabilidad, DI y patrones estructurales; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «crear notificadores y pedidos válidos para canales y configuraciones variables» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales».

**Criterio de salida:** entrega «ejemplos Java ejecutables para 5 variantes Singleton y 4 patrones creacionales», explica «usar Singleton global para estado mutable o construir fábricas sin variación real» y demuestra cómo patrones creacionales se conecta con SOLID, inmutabilidad, DI y patrones estructurales.

**Fuentes primarias para iniciar:** refactoring.guru/design-patterns/creational-patterns; examples/java/patrones-rutaflow/CreationalPatternsDemo.java.

## Tema 45: Patrones estructurales

**Meta:** seis ejemplos Java ejecutables con estructura, salida, coste y alternativa

**Contexto de práctica:** integrar una pasarela legacy sin cambiar el contrato del dominio

**Conocimientos que conecta:** SOLID, Factory, microservicios y boundaries

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «integrar una pasarela legacy sin cambiar el contrato del dominio» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: seis ejemplos Java ejecutables con estructura, salida, coste y alternativa.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar patrones estructurales.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Adapter, Decorator, Facade, Composite, Proxy y Bridge.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Adapter, Decorator, Facade, Composite, Proxy y Bridge antes de memorizar términos.
- [ ] **Paso 6.** Prepara Java 17+, JUnit y diagramas UML; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en refactoring.guru/design-patterns/structural-patterns; examples/java/patrones-rutaflow/StructuralPatternsDemo.java una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «integrar una pasarela legacy sin cambiar el contrato del dominio» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «envolver un SDK de pago legacy con Adapter y añadir logging con Decorator» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «apilar capas sin necesidad o usar Proxy y Adapter con intenciones indistinguibles» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Adapter, Decorator, Facade, Composite, Proxy y Bridge y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «integrar una pasarela legacy sin cambiar el contrato del dominio» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de patrones estructurales.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Adapter, Decorator, Facade, Composite, Proxy y Bridge.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «seis ejemplos Java ejecutables con estructura, salida, coste y alternativa».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en refactoring.guru/design-patterns/structural-patterns; examples/java/patrones-rutaflow/StructuralPatternsDemo.java.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «seis ejemplos Java ejecutables con estructura, salida, coste y alternativa» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta patrones estructurales con SOLID, Factory, microservicios y boundaries; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «integrar una pasarela legacy sin cambiar el contrato del dominio» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «seis ejemplos Java ejecutables con estructura, salida, coste y alternativa».

**Criterio de salida:** entrega «seis ejemplos Java ejecutables con estructura, salida, coste y alternativa», explica «apilar capas sin necesidad o usar Proxy y Adapter con intenciones indistinguibles» y demuestra cómo patrones estructurales se conecta con SOLID, Factory, microservicios y boundaries.

**Fuentes primarias para iniciar:** refactoring.guru/design-patterns/structural-patterns; examples/java/patrones-rutaflow/StructuralPatternsDemo.java.

## Tema 46: Patrones de comportamiento

**Meta:** diez ejemplos Java completos con main, salida y ejercicio incremental

**Contexto de práctica:** desacoplar cambios de pedidos, políticas y pasos de procesamiento

**Conocimientos que conecta:** Spring Events, Kafka, SOLID y patrones de arquitectura

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «desacoplar cambios de pedidos, políticas y pasos de procesamiento» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: diez ejemplos Java completos con main, salida y ejercicio incremental.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar patrones de comportamiento.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Observer, Strategy, Command, Template Method, Chain, State, Iterator, Mediator, Memento y Visitor.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Observer, Strategy, Command, Template Method, Chain, State, Iterator, Mediator, Memento y Visitor antes de memorizar términos.
- [ ] **Paso 6.** Prepara Java 17+, JUnit y consola; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en refactoring.guru/design-patterns/behavioral-patterns; examples/java/patrones-rutaflow/BehavioralPatternsDemo.java una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «desacoplar cambios de pedidos, políticas y pasos de procesamiento» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «modelar el ciclo de pedido con State y emitir observers desacoplados, comparando con eventos Spring/Kafka» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «usar herencia para cada variación o ignorar orden, concurrencia y ciclo de vida» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Observer, Strategy, Command, Template Method, Chain, State, Iterator, Mediator, Memento y Visitor y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «desacoplar cambios de pedidos, políticas y pasos de procesamiento» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de patrones de comportamiento.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Observer, Strategy, Command, Template Method, Chain, State, Iterator, Mediator, Memento y Visitor.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «diez ejemplos Java completos con main, salida y ejercicio incremental».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en refactoring.guru/design-patterns/behavioral-patterns; examples/java/patrones-rutaflow/BehavioralPatternsDemo.java.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «diez ejemplos Java completos con main, salida y ejercicio incremental» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta patrones de comportamiento con Spring Events, Kafka, SOLID y patrones de arquitectura; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «desacoplar cambios de pedidos, políticas y pasos de procesamiento» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «diez ejemplos Java completos con main, salida y ejercicio incremental».

**Criterio de salida:** entrega «diez ejemplos Java completos con main, salida y ejercicio incremental», explica «usar herencia para cada variación o ignorar orden, concurrencia y ciclo de vida» y demuestra cómo patrones de comportamiento se conecta con Spring Events, Kafka, SOLID y patrones de arquitectura.

**Fuentes primarias para iniciar:** refactoring.guru/design-patterns/behavioral-patterns; examples/java/patrones-rutaflow/BehavioralPatternsDemo.java.

## Tema 47: Patrones de arquitectura

**Meta:** catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón

**Contexto de práctica:** evolucionar RutaFlow desde una app única a límites de dominio justificados

**Conocimientos que conecta:** DDD, base de datos, eventos, seguridad y operación

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «evolucionar RutaFlow desde una app única a límites de dominio justificados» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar patrones de arquitectura.
- [ ] **Paso 4.** Define un glosario propio para las piezas de Monolith, Modular Monolith, Microservices, EDA, Hexagonal, Clean, CQRS, Event Sourcing, Saga, Outbox, Gateway, BFF, Serverless, Layered, Pipeline, Space-Based y Microkernel.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de Monolith, Modular Monolith, Microservices, EDA, Hexagonal, Clean, CQRS, Event Sourcing, Saga, Outbox, Gateway, BFF, Serverless, Layered, Pipeline, Space-Based y Microkernel antes de memorizar términos.
- [ ] **Paso 6.** Prepara Java 17+, Spring Boot, Kafka, Maven y C4; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en martinfowler.com/architecture/; microservices.io/patterns/; web/public/content/spring-boot/modulo-10.md; modulo-12.md; modulo-15.md; modulo-21.md una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «evolucionar RutaFlow desde una app única a límites de dominio justificados» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «construir un ejemplo ejecutable de Outbox y contrastar 4 servicios/gateway frente a un monolito modular» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «distribuir servicios sin autonomía de datos o introducir event sourcing sin requisito de historial» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de Monolith, Modular Monolith, Microservices, EDA, Hexagonal, Clean, CQRS, Event Sourcing, Saga, Outbox, Gateway, BFF, Serverless, Layered, Pipeline, Space-Based y Microkernel y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «evolucionar RutaFlow desde una app única a límites de dominio justificados» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de patrones de arquitectura.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a Monolith, Modular Monolith, Microservices, EDA, Hexagonal, Clean, CQRS, Event Sourcing, Saga, Outbox, Gateway, BFF, Serverless, Layered, Pipeline, Space-Based y Microkernel.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en martinfowler.com/architecture/; microservices.io/patterns/; web/public/content/spring-boot/modulo-10.md; modulo-12.md; modulo-15.md; modulo-21.md.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta patrones de arquitectura con DDD, base de datos, eventos, seguridad y operación; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «evolucionar RutaFlow desde una app única a límites de dominio justificados» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón».

**Criterio de salida:** entrega «catálogo comparativo con ejemplos/runnable skeletons y decisiones explícitas para cada patrón», explica «distribuir servicios sin autonomía de datos o introducir event sourcing sin requisito de historial» y demuestra cómo patrones de arquitectura se conecta con DDD, base de datos, eventos, seguridad y operación.

**Fuentes primarias para iniciar:** martinfowler.com/architecture/; microservices.io/patterns/; web/public/content/spring-boot/modulo-10.md; modulo-12.md; modulo-15.md; modulo-21.md.

## Tema 48: Principios de arquitectura

**Meta:** checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor

**Contexto de práctica:** revisar una solución que ya tiene requisitos, usuarios y límites cambiantes

**Conocimientos que conecta:** Clean Architecture, microservices y operación cloud

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «revisar una solución que ya tiene requisitos, usuarios y límites cambiantes» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar principios de arquitectura.
- [ ] **Paso 4.** Define un glosario propio para las piezas de SOLID, DRY/KISS/YAGNI, Demeter, Hollywood, separation, cohesion/coupling, idempotency, stateless/stateful y 12-Factor.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de SOLID, DRY/KISS/YAGNI, Demeter, Hollywood, separation, cohesion/coupling, idempotency, stateless/stateful y 12-Factor antes de memorizar términos.
- [ ] **Paso 6.** Prepara Java, tests, ADR y aplicación de referencia; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en 12factor.net; martinfowler.com/bliki/ una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «revisar una solución que ya tiene requisitos, usuarios y límites cambiantes» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «evaluar tres decisiones contra contexto y documentar cuándo un principio entra en tensión con otro» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «aplicar DRY creando abstracciones antes de conocer variaciones o tratar 12-factor como arquitectura completa» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de SOLID, DRY/KISS/YAGNI, Demeter, Hollywood, separation, cohesion/coupling, idempotency, stateless/stateful y 12-Factor y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «revisar una solución que ya tiene requisitos, usuarios y límites cambiantes» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de principios de arquitectura.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a SOLID, DRY/KISS/YAGNI, Demeter, Hollywood, separation, cohesion/coupling, idempotency, stateless/stateful y 12-Factor.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en 12factor.net; martinfowler.com/bliki/.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta principios de arquitectura con Clean Architecture, microservices y operación cloud; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «revisar una solución que ya tiene requisitos, usuarios y límites cambiantes» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor».

**Criterio de salida:** entrega «checklist razonada con ADR y ejemplo donde no aplicar una regla sería mejor», explica «aplicar DRY creando abstracciones antes de conocer variaciones o tratar 12-factor como arquitectura completa» y demuestra cómo principios de arquitectura se conecta con Clean Architecture, microservices y operación cloud.

**Fuentes primarias para iniciar:** 12factor.net; martinfowler.com/bliki/.

## Tema 49: Anti-patrones

**Meta:** catálogo de síntomas, consecuencias, señales y plan de salida verificable

**Contexto de práctica:** diagnosticar degradación de un servicio antes de multiplicar excepciones y parches

**Conocimientos que conecta:** SOLID, métricas, refactoring y microservicios

### Pasos 1–10: nivel Principiante

- [ ] **Paso 1.** Describe el problema de industria «diagnosticar degradación de un servicio antes de multiplicar excepciones y parches» y quién recibe valor de resolverlo.
- [ ] **Paso 2.** Escribe el resultado experto observable: catálogo de síntomas, consecuencias, señales y plan de salida verificable.
- [ ] **Paso 3.** Enumera lo que ya sabes y los prerrequisitos mínimos para estudiar anti-patrones.
- [ ] **Paso 4.** Define un glosario propio para las piezas de God Object, Spaghetti, Big Ball of Mud, Lava Flow, Golden Hammer, premature optimization, copy-paste, Singleton misuse, Anemic Domain y Distributed Monolith.
- [ ] **Paso 5.** Dibuja el modelo, flujo o sistema físico de God Object, Spaghetti, Big Ball of Mud, Lava Flow, Golden Hammer, premature optimization, copy-paste, Singleton misuse, Anemic Domain y Distributed Monolith antes de memorizar términos.
- [ ] **Paso 6.** Prepara Java, tests, static analysis y C4; registra versión, comandos y una forma segura de limpiar el laboratorio.
- [ ] **Paso 7.** Encuentra en martinfowler.com/bliki/AntiPattern.html; refactoring.guru una explicación oficial y anota qué conceptos confirma.
- [ ] **Paso 8.** Traza un caso exitoso de «diagnosticar degradación de un servicio antes de multiplicar excepciones y parches» desde la entrada hasta el resultado.
- [ ] **Paso 9.** Resuelve «identificar causa observable y escoger una refactorización incremental con test de regresión» con la solución más pequeña que funcione.
- [ ] **Paso 10.** Provoca el error «usar etiquetas para juzgar código sin contexto o intentar una reescritura big-bang» en un entorno desechable y captura la evidencia.

### Pasos 11–20: nivel Intermedio

- [ ] **Paso 11.** Diagnostica el fallo anterior paso a paso; explica causa, síntoma y corrección, sin ocultar el error.
- [ ] **Paso 12.** Implementa la pieza central de God Object, Spaghetti, Big Ball of Mud, Lava Flow, Golden Hammer, premature optimization, copy-paste, Singleton misuse, Anemic Domain y Distributed Monolith y sepárala de presentación/configuración cuando corresponda.
- [ ] **Paso 13.** Añade pruebas para caso normal, borde, entrada inválida y una regresión del fallo provocado.
- [ ] **Paso 14.** Compara dos enfoques para «diagnosticar degradación de un servicio antes de multiplicar excepciones y parches» y registra un criterio medible para elegir.
- [ ] **Paso 15.** Especifica entradas, salidas, errores esperados y supuestos del componente de anti-patrones.
- [ ] **Paso 16.** Revisa validación, permisos, datos sensibles, unidades o seguridad funcional pertinentes a God Object, Spaghetti, Big Ball of Mud, Lava Flow, Golden Hammer, premature optimization, copy-paste, Singleton misuse, Anemic Domain y Distributed Monolith.
- [ ] **Paso 17.** Introduce un fallo propio del dominio —por ejemplo entrada inválida, inconsistencia, pérdida de conexión o error de colaboración— y define cómo recuperarte.
- [ ] **Paso 18.** Mide una propiedad adecuada al problema —tiempo, calidad, error, consultas, recursos o esfuerzo— y conserva la línea base.
- [ ] **Paso 19.** Optimiza solo una limitación demostrada y compara la medición antes/después.
- [ ] **Paso 20.** Comprueba persistencia, reinicio, reproducibilidad o restauración del resultado «catálogo de síntomas, consecuencias, señales y plan de salida verificable».

### Pasos 21–30: nivel Avanzado

- [ ] **Paso 21.** Automatiza build, análisis o verificación del ejercicio para detectar regresiones al cambiarlo.
- [ ] **Paso 22.** Documenta una decisión técnica y enlaza evidencia primaria consultada en martinfowler.com/bliki/AntiPattern.html; refactoring.guru.
- [ ] **Paso 23.** Pide revisión a otra persona o usa una checklist; corrige un problema concreto de claridad o robustez.
- [ ] **Paso 24.** Completa un laboratorio autónomo que produzca «catálogo de síntomas, consecuencias, señales y plan de salida verificable» y guarda entrada, salida y pruebas.
- [ ] **Paso 25.** Evalúa el laboratorio contra criterios explícitos: corrección, casos límite, seguridad y evidencia.
- [ ] **Paso 26.** Conecta anti-patrones con SOLID, métricas, refactoring y microservicios; dibuja el contrato entre ambos conocimientos.
- [ ] **Paso 27.** Diseña una parte del proyecto integrador para «diagnosticar degradación de un servicio antes de multiplicar excepciones y parches» y registra dependencias y riesgos.
- [ ] **Paso 28.** Construye esa parte, ejecuta las pruebas y registra qué no cubre el entorno de laboratorio.
- [ ] **Paso 29.** Amplía hacia el nivel avanzado con una restricción real: escala, concurrencia, tolerancia a fallos o incertidumbre.
- [ ] **Paso 30.** Explica el sistema sin notas, defiende una decisión con evidencia y enseña a otra persona a reproducir «catálogo de síntomas, consecuencias, señales y plan de salida verificable».

**Criterio de salida:** entrega «catálogo de síntomas, consecuencias, señales y plan de salida verificable», explica «usar etiquetas para juzgar código sin contexto o intentar una reescritura big-bang» y demuestra cómo anti-patrones se conecta con SOLID, métricas, refactoring y microservicios.

**Fuentes primarias para iniciar:** martinfowler.com/bliki/AntiPattern.html; refactoring.guru.
