# Módulo 10: Secretos y configuración: Secrets Manager, Key Vault y Secret Manager

## Sílabo

**Objetivo general**

Gestionar secretos, contraseñas y configuración externalizada de forma segura, entendiendo que ningún secreto debe vivir jamás en el código fuente ni en variables de entorno hardcodeadas, y dominando la diferencia entre almacenamiento simple de configuración y almacenamiento cifrado de secretos sensibles.

**Objetivos específicos**

1. Crear y leer un secreto con AWS Secrets Manager desde la CLI y desde Python.
2. Cifrar y descifrar un valor con AWS KMS, entendiendo envelope encryption.
3. Guardar configuración no sensible con SSM Parameter Store.
4. Repetir el mismo patrón de secretos en GCP Secret Manager y Azure Key Vault.

**Contenido**

- Least privilege.
- KMS / envelope encryption.
- Rotación de secretos.
- SSM Parameter Store vs Secrets Manager.
- AWS Config.

**Evaluación**

Aplicación que lee todos sus secretos y configuración desde la nube, sin nada hardcodeado, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Secrets Manager y por qué no usar variables de entorno hardcodeadas

**Conceptos clave:** un secreto centralizado, auditable y rotable, no disperso en archivos de configuración.

```bash
aws secretsmanager create-secret --name /app/db-password --secret-string "mi-password-segura"
aws secretsmanager get-secret-value --secret-id /app/db-password --query SecretString --output text
```

Guardar una contraseña de base de datos directamente como una variable de entorno hardcodeada en un archivo `.env` versionado (o peor, directamente en el código fuente) expone ese secreto a cualquiera con acceso de lectura al repositorio, incluyendo el historial completo de commits pasados incluso si se elimina posteriormente del código actual; AWS Secrets Manager centraliza ese secreto en un servicio dedicado, cifrado en reposo, con control de acceso granular vía IAM (Módulo 7) que determina exactamente qué usuarios o roles pueden leer ese secreto específico, y con un historial de auditoría de cada acceso, capacidades que ningún archivo de configuración plano puede ofrecer de forma nativa.

Leer el secreto desde Python (`client.get_secret_value(SecretId="/app/db-password")`) en tiempo de ejecución, en vez de inyectarlo como variable de entorno al desplegar, significa que el valor del secreto nunca necesita persistir en ningún archivo de configuración de despliegue, reduciendo la superficie de exposición a solo el momento exacto en que la aplicación efectivamente lo necesita, con el beneficio adicional de que rotar el secreto (cambiar la contraseña) no requiere redesplegar la aplicación, solo actualizar el valor en Secrets Manager para que la próxima lectura obtenga automáticamente el valor nuevo.

**Analogía:** Secrets Manager es como una caja fuerte central con registro de auditoría de cada apertura, en vez de dejar la llave de la casa bajo el felpudo (una variable de entorno hardcodeada) donde cualquiera que sepa buscar ahí puede encontrarla sin dejar ningún rastro de que lo hizo.

**¿Por qué es importante?** Guardar secretos en variables de entorno hardcodeadas expone el valor a cualquiera con acceso al código (incluyendo el historial de versiones), sin auditoría ni control de acceso granular; Secrets Manager centraliza, cifra, audita y permite rotar secretos sin redesplegar la aplicación.

**Diagrama:**

```bash
aws secretsmanager create-secret --name /app/db-password --secret-string "mi-password-segura"
aws secretsmanager get-secret-value --secret-id /app/db-password --query SecretString --output text
```

### Tema 2: KMS y envelope encryption

**Conceptos clave:** cifrar la clave que cifra los datos, no solo los datos directamente.

```bash
aws kms create-key --description "Clave de la app"
aws kms encrypt --key-id alias/mi-clave --plaintext fileb://secreto.txt --query CiphertextBlob --output text | base64 -d > secreto.enc
aws kms decrypt --ciphertext-blob fileb://secreto.enc --query Plaintext --output text | base64 -d
```

KMS (Key Management Service) gestiona claves de cifrado (CMK, Customer Master Keys) usadas para cifrar y descifrar datos directamente mediante `encrypt`/`decrypt`, pero su uso más común y eficiente en la práctica es a través de "envelope encryption": en vez de cifrar directamente un volumen grande de datos con la clave maestra (una operación relativamente costosa y con límites de tamaño de payload), se genera una clave de datos temporal (data key) cifrada por la clave maestra de KMS, se usa esa clave de datos para cifrar el volumen real de información (una operación local, rápida, sin límite de tamaño), y se almacena junto a los datos cifrados únicamente la clave de datos ya cifrada (nunca en texto plano); para descifrar, primero se usa KMS para descifrar la clave de datos, y luego esa clave de datos ya descifrada se usa localmente para descifrar el volumen real de información.

Este patrón de dos niveles (una clave maestra centralizada en KMS que nunca sale del servicio, protegiendo claves de datos más efímeras que sí se usan directamente sobre los datos) es el mismo principio que sustenta el cifrado de discos completos en sistemas operativos modernos, y explica por qué servicios como S3 o RDS pueden ofrecer cifrado en reposo transparente sin sacrificar rendimiento: la operación costosa de KMS ocurre una única vez por clave de datos, no en cada operación individual sobre los datos.

**Analogía:** envelope encryption es como guardar el contenido valioso de una caja fuerte (los datos) usando una combinación temporal específica de esa caja (la clave de datos), y luego guardar esa combinación temporal dentro de otra caja fuerte maestra central mucho más protegida (KMS) que rara vez se abre directamente, en vez de usar la combinación de la caja fuerte maestra directamente sobre cada objeto individual que se quiere proteger.

**¿Por qué es importante?** Envelope encryption permite cifrar grandes volúmenes de datos de forma eficiente localmente, mientras la clave maestra centralizada en KMS (que nunca sale del servicio) protege únicamente la clave de datos más pequeña y efímera, combinando seguridad centralizada con rendimiento práctico.

**Diagrama:**

```
Clave maestra (KMS, nunca sale del servicio)
   ↓ cifra
Clave de datos (efímera, cifra los datos reales localmente)
   ↓ cifra
Datos reales (volumen grande, cifrado localmente con la clave de datos)
```

### Tema 3: SSM Parameter Store vs Secrets Manager

**Conceptos clave:** configuración general frente a secretos sensibles con rotación automática.

```bash
aws ssm put-parameter --name /app/api-url --value "http://localhost:4566" --type String
```

SSM Parameter Store almacena configuración general de la aplicación (URLs de endpoints, flags de features, valores no necesariamente sensibles) de forma más simple y económica que Secrets Manager, con soporte también para valores cifrados (`SecureString`) cuando se necesita, pero sin las capacidades avanzadas específicas de gestión de secretos como rotación automática programada (Secrets Manager puede rotar automáticamente una contraseña de base de datos en un horario configurado, invocando una Lambda que genera una nueva contraseña, la actualiza en la base de datos, y actualiza el secreto almacenado, todo sin intervención manual) o integración nativa más profunda con otros servicios de gestión de credenciales de bases de datos.

La elección práctica entre ambos suele seguir una regla simple: usar Parameter Store para configuración general de la app (más económico, suficiente para ese caso), y reservar Secrets Manager específicamente para credenciales sensibles que se benefician de rotación automática y de las capacidades de auditoría más completas de ese servicio dedicado; AWS Config, por su parte, es un servicio distinto que audita continuamente la configuración de los recursos de la cuenta (no de la aplicación), verificando que cumplan reglas de compliance definidas (por ejemplo, que ningún bucket S3 sea público accidentalmente).

**Analogía:** Parameter Store es como un tablón de anuncios general de la oficina donde se publican configuraciones y avisos rutinarios; Secrets Manager es como una bóveda especializada con protocolo de cambio periódico automático de combinación, reservada específicamente para los objetos más sensibles que requieren ese nivel adicional de protección y renovación.

**¿Por qué es importante?** SSM Parameter Store es apropiado y más económico para configuración general no sensible; Secrets Manager se reserva para credenciales sensibles que se benefician de rotación automática programada y auditoría más completa.

**Diagrama:**

```
SSM Parameter Store  → configuración general, económico, rotación manual
Secrets Manager       → secretos sensibles, rotación automática programada, auditoría completa
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** construir una aplicación que lee todos sus secretos y configuración desde la nube, sin nada hardcodeado.

**Requisitos previos:** Módulos 0-9 completados (cloud local corriendo).

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Crear un secreto en Secrets Manager | `aws secretsmanager create-secret --name /app/db-password --secret-string "..."` | Cifrado en reposo |
| 2 | Leerlo desde Python con boto3 | `client.get_secret_value(SecretId="/app/db-password")` | En tiempo de ejecución |
| 3 | Cifrar/descifrar con KMS | `aws kms encrypt` / `aws kms decrypt` | Envelope encryption |
| 4 | Guardar configuración con SSM | `aws ssm put-parameter --name /app/api-url --value "..." --type String` | No sensible |
| 5 | Repetir en GCP Secret Manager y Azure Key Vault | `gcloud secrets create` / `az keyvault secret set` | Mismo patrón multi-nube |

**Verificación:** el laboratorio se considera exitoso si la aplicación no contiene ningún secreto ni configuración hardcodeada en su código fuente, leyendo todo dinámicamente desde los servicios correspondientes en tiempo de ejecución.

**Errores comunes y soluciones**

- **Guardar contraseñas en un archivo `.env` versionado en el repositorio.** Migra a Secrets Manager, cifrado y auditable.
- **Usar Secrets Manager para configuración simple no sensible.** Usa SSM Parameter Store, más económico para ese caso.
- **Cifrar directamente volúmenes grandes de datos con la clave maestra de KMS.** Usa envelope encryption con una clave de datos efímera para eficiencia.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué no guardar secretos en variables de entorno

**Enunciado:** ¿por qué no debes guardar secretos en variables de entorno hardcodeadas en el código?

**Solución esperada:** expone el secreto a cualquiera con acceso de lectura al repositorio, incluyendo el historial completo de commits pasados incluso si se elimina posteriormente, sin ningún control de acceso granular ni auditoría de quién accedió a ese valor.

**Criterios de éxito:**
- Explica correctamente la exposición en el historial de versiones y la falta de auditoría como razones.

### Ejercicio 2: Diferencia entre SSM Parameter Store y Secrets Manager

**Enunciado:** ¿qué diferencia hay entre SSM Parameter Store y Secrets Manager?

**Solución esperada:** Parameter Store es más simple y económico, apropiado para configuración general no necesariamente sensible; Secrets Manager ofrece capacidades avanzadas específicas de gestión de secretos, como rotación automática programada, reservado para credenciales sensibles.

**Criterios de éxito:**
- Distingue correctamente el caso de uso de cada uno según sensibilidad y necesidad de rotación automática.

### Ejercicio 3: Qué es envelope encryption

**Enunciado:** ¿qué es envelope encryption?

**Solución esperada:** un patrón de cifrado de dos niveles donde una clave de datos efímera cifra el volumen real de información localmente (rápido, sin límite de tamaño), y esa clave de datos se cifra a su vez con la clave maestra centralizada de KMS (que nunca sale del servicio), combinando eficiencia práctica con seguridad centralizada.

**Criterios de éxito:**
- Explica correctamente el cifrado en dos niveles (clave de datos cifrando datos, clave maestra cifrando la clave de datos).

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- AWS, Microsoft Azure y Google Cloud, marcos oficiales de arquitectura bien diseñada.
- NIST, *Cloud Computing Standards Roadmap* y *Secure Software Development Framework*.
- Beyer et al., *Site Reliability Engineering*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Guardar secretos en variables de entorno hardcodeadas los expone en el historial de versiones sin auditoría ni control de acceso granular.
- Envelope encryption combina eficiencia (clave de datos local) con seguridad centralizada (clave maestra en KMS).
- SSM Parameter Store es apropiado para configuración general; Secrets Manager para secretos sensibles con rotación automática.
- El mismo patrón de gestión de secretos se replica en GCP Secret Manager y Azure Key Vault.

**Conceptos aprendidos**

- Least privilege.
- KMS / envelope encryption.
- Rotación de secretos.
- SSM Parameter Store vs Secrets Manager.
- AWS Config.

**Próximos pasos**

En el Módulo 11 aprenderás mensajería Pub/Sub con SNS y EventBridge, distribuyendo eventos a múltiples consumidores con el patrón fan-out.

**Recursos adicionales**

- Documentación oficial de AWS Secrets Manager (docs.aws.amazon.com/secretsmanager).
