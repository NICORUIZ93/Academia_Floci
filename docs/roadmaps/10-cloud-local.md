# Bloque 10: Cloud local

Este bloque contiene 1 roadmaps independientes. Cada roadmap avanza en 30 pasos, desde cero hasta una evidencia de nivel avanzado; no presupone experiencia previa en el tema.

Los pasos 1–10 construyen fundamentos, 11–20 desarrollan práctica y diagnóstico, y 21–30 integran el tema en un resultado más cercano al trabajo profesional. Marca cada casilla solo cuando puedas mostrar la evidencia indicada.

## Tema 32: Cloud local con LocalStack y Floci

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
