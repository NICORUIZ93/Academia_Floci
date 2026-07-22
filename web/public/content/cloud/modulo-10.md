# Módulo 10: Secretos y configuración: Secrets Manager, Key Vault y Secret Manager


## Aprende construyendo

### Tema 1: Secrets Manager y por qué no usar variables de entorno hardcodeadas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás gestionar secretos desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una API necesita credenciales sin incluirlas en Git ni en imágenes.
#### Paso 3 · Teoría, modelo mental y analogía
Un gestor de secretos es una caja fuerte con registro, rotación y acceso limitado.
#### Paso 4 · Demostración guiada
Crea `src/secrets.js` desde una carpeta vacía.
```bash
mkdir ejemplo-secrets
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: deja un secreto en texto plano para provocar un fallo deliberado y elimínalo.
#### Paso 6 · Práctica independiente
Define rotación y auditoría.
#### Paso 7 · Cierre y evidencia
Entrega policy, salida, fallo y corrección; explica el resultado. Siguiente paso: cifrado. Errores comunes: secretos en logs y acceso global. Fuente oficial: https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html.
**Conceptos clave:** un secreto centralizado, auditable y rotable, no disperso en archivos de configuración.

```bash
aws secretsmanager create-secret --name /app/db-password --secret-string "mi-password-segura"
aws secretsmanager get-secret-value --secret-id /app/db-password --query SecretString --output text
```

En el primer comando, `--name` es el identificador con el que vas a referirte a este secreto después (aquí, una ruta tipo carpeta: `/app/db-password`) y `--secret-string` es el valor real que querés guardar, en texto plano en el comando pero cifrado en reposo por Secrets Manager. En el segundo comando, `--secret-id` es ese mismo identificador para pedir el secreto de vuelta; `--query` filtra la respuesta JSON completa que devolvería la API usando una expresión JMESPath (aquí, `SecretString` se queda solo con el valor del secreto, descartando metadatos como fecha de creación o ARN); y `--output text` le dice a la AWS CLI que imprima ese resultado como texto plano en vez de JSON, más cómodo para copiar o pasar a otro comando.

Guardar una contraseña de base de datos directamente como una variable de entorno hardcodeada en un archivo `.env` versionado (o peor, directamente en el código fuente) expone ese secreto a cualquiera con acceso de lectura al repositorio, incluyendo el historial completo de commits pasados incluso si se elimina posteriormente del código actual; AWS Secrets Manager centraliza ese secreto en un servicio dedicado, cifrado en reposo, con control de acceso granular vía IAM (Módulo 7) que determina exactamente qué usuarios o roles pueden leer ese secreto específico, y con un historial de auditoría de cada acceso, capacidades que ningún archivo de configuración plano puede ofrecer de forma nativa.

Leer el secreto desde Python (`client.get_secret_value(SecretId="/app/db-password")`) en tiempo de ejecución, en vez de inyectarlo como variable de entorno al desplegar, significa que el valor del secreto nunca necesita persistir en ningún archivo de configuración de despliegue, reduciendo la superficie de exposición a solo el momento exacto en que la aplicación efectivamente lo necesita, con el beneficio adicional de que rotar el secreto (cambiar la contraseña) no requiere redesplegar la aplicación, solo actualizar el valor en Secrets Manager para que la próxima lectura obtenga automáticamente el valor nuevo.

**Analogía:** Secrets Manager es como una caja fuerte central con registro de auditoría de cada apertura, en vez de dejar la llave de la casa bajo el felpudo (una variable de entorno hardcodeada) donde cualquiera que sepa buscar ahí puede encontrarla sin dejar ningún rastro de que lo hizo.

**¿Por qué es importante?** Guardar secretos en variables de entorno hardcodeadas expone el valor a cualquiera con acceso al código (incluyendo el historial de versiones), sin auditoría ni control de acceso granular; Secrets Manager centraliza, cifra, audita y permite rotar secretos sin redesplegar la aplicación.

**Prueba en terminal:**

```bash
aws secretsmanager create-secret --name /app/db-password --secret-string "mi-password-segura"
aws secretsmanager get-secret-value --secret-id /app/db-password --query SecretString --output text
```

### Tema 2: KMS y envelope encryption

#### Paso 1 · Objetivo y preparación
Al finalizar podrás explicar envelope encryption desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una base de datos necesita proteger datos y controlar quién descifra.
#### Paso 3 · Teoría, modelo mental y analogía
Se cifra el contenido con una llave de datos y esa llave con una llave maestra.
#### Paso 4 · Demostración guiada
Crea `src/encryption.js` desde una carpeta vacía.
```bash
mkdir ejemplo-kms
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: usa una clave sin permiso para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Documenta rotación, acceso y recuperación.
#### Paso 7 · Cierre y evidencia
Entrega diseño, salida, fallo y corrección; explica el resultado. Siguiente paso: parámetros. Errores comunes: compartir claves maestras y perder contexto. Fuente oficial: https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html.
**Conceptos clave:** cifrar la clave que cifra los datos, no solo los datos directamente.

```bash
aws kms create-key --description "Clave de la app"
aws kms encrypt --key-id alias/mi-clave --plaintext fileb://secreto.txt --query CiphertextBlob --output text | base64 -d > secreto.enc
aws kms decrypt --ciphertext-blob fileb://secreto.enc --query Plaintext --output text | base64 -d
```

`--description` es solo una etiqueta legible para identificar la clave más adelante (no afecta el cifrado). `--key-id` señala qué clave maestra usar para cifrar — acá, un alias legible (`alias/mi-clave`) en vez del identificador interno de la clave. `--plaintext` es el archivo con el dato sin cifrar que le entregás al comando (el prefijo `fileb://` le dice a la CLI que lo lea como binario); el resultado cifrado sale por `--query CiphertextBlob`, el mismo filtro JMESPath que ya viste en Secrets Manager. Para revertir el proceso, `--ciphertext-blob` es el archivo cifrado que querés descifrar.

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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir Parameter Store o Secrets Manager desde cero. Prerrequisitos: Node.js y AWS CLI; verifica `node --version`.
#### Paso 2 · Contexto y caso real
Una aplicación separa configuración pública de credenciales sensibles.
#### Paso 3 · Teoría, modelo mental y analogía
Parameter Store es tablero de configuración; Secrets Manager es caja fuerte rotatoria.
#### Paso 4 · Demostración guiada
Crea `src/parameters.js` desde una carpeta vacía.
```bash
mkdir ejemplo-parameters
node --version
```
Resultado esperado: Node disponible.
#### Paso 5 · Práctica guiada
Pista: lee un parámetro con rol incorrecto para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Clasifica cinco valores y justifica.
#### Paso 7 · Cierre y evidencia
Entrega clasificación, salida, fallo y corrección; explica el resultado. Siguiente paso: mensajería. Errores comunes: guardar secretos como configuración común y no rotar. Fuente oficial: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html.
**Conceptos clave:** configuración general frente a secretos sensibles con rotación automática.

```bash
aws ssm put-parameter --name /app/api-url --value "http://localhost:4566" --type String
```

`--name` vuelve a ser el identificador del parámetro (igual que en Secrets Manager); `--value` es el contenido que guardás; `--type` declara qué clase de parámetro es — `String` para texto plano, `StringList` para una lista, o `SecureString` cuando querés que SSM lo cifre igual que un secreto.

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
