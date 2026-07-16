# Módulo 20: IA y servicios especializados: Bedrock, Textract y Transcribe

## Sílabo

**Objetivo general**

Integrar modelos de IA generativa y procesamiento automático de documentos y audio en una aplicación, entendiendo que cloud local emula Bedrock con stubs deterministas, y aprendiendo a distinguir qué aspectos de un sistema de IA se pueden probar localmente con confianza y cuáles requieren validación contra el modelo real.

**Objetivos específicos**

1. Invocar un modelo de Bedrock Runtime y observar la respuesta stub determinista.
2. Extraer texto y estructura de un documento con Textract.
3. Transcribir un archivo de audio con Transcribe.
4. Escribir una prueba de contrato para el stub de Bedrock.

**Contenido**

- Bedrock Runtime.
- InvokeModel API.
- Textract (OCR).
- Transcribe (STT).
- Stub vs Mock.
- Prompt engineering.
- Token limits.

**Evaluación**

API que procesa documentos con Textract, guarda el texto en DynamoDB y genera un resumen con Bedrock, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Bedrock Runtime y respuestas stub deterministas

**Conceptos clave:** probar la estructura del contrato de integración, no el contenido generativo real.

```bash
aws bedrock-runtime invoke-model --model-id anthropic.claude-3-sonnet-20240229-v1:0 --body '{"prompt":"Hola","max_tokens":100}' --cli-binary-format raw-in-base64-out output.json
```

Bedrock Runtime expone modelos de IA generativa (LLMs de distintos proveedores) a través de una API HTTP unificada (`InvokeModel`), permitiendo integrar capacidades de generación de texto, resumen, o análisis en una aplicación sin gestionar infraestructura de modelo propia; cloud local, al no poder ejecutar modelos de lenguaje reales localmente (por su tamaño y requisitos computacionales), devuelve en cambio una respuesta stub determinista: la misma entrada siempre produce exactamente la misma salida predefinida, en vez de la variabilidad inherente y no determinista de un modelo real (donde incluso el mismo prompt exacto puede producir respuestas ligeramente distintas en invocaciones sucesivas).

Esta determinismo del stub es una característica deliberada y valiosa para testing: permite escribir pruebas automatizadas confiables sobre el flujo de integración completo (¿la aplicación construye correctamente el prompt? ¿parsea correctamente la estructura de la respuesta? ¿maneja correctamente errores de la API?) sin la variabilidad no determinista que haría frágil cualquier aserción sobre el contenido exacto de una respuesta generativa real.

**Analogía:** un stub determinista de Bedrock es como un maniquí de práctica que siempre responde de forma idéntica y predecible ante el mismo estímulo específico de entrenamiento, permitiendo verificar consistentemente que el procedimiento de interacción se ejecuta correctamente, en vez de practicar con una persona real cuyas respuestas variarían de forma natural entre cada repetición del mismo ejercicio.

**¿Por qué es importante?** cloud local usa stubs deterministas para IA en vez de modelos reales porque permite escribir pruebas automatizadas confiables sobre la estructura del flujo de integración, sin la variabilidad no determinista inherente de un modelo real que haría frágil cualquier aserción sobre contenido exacto.

**Diagrama:**

```bash
aws bedrock-runtime invoke-model --model-id ... --body '{"prompt":"Hola"}' ...
# cloud local: MISMA entrada → SIEMPRE la misma salida stub (determinista)
# AWS real: misma entrada → puede variar entre invocaciones (no determinista)
```

### Tema 2: Textract y Transcribe

**Conceptos clave:** extracción estructurada de información desde formatos no estructurados (imágenes, audio).

```bash
aws textract analyze-document --document '{"S3Object":{"Bucket":"mi-bucket","Name":"documento.jpg"}}' --feature-types TABLES FORMS
```

Textract extrae texto y estructura (tablas, pares clave-valor de formularios) directamente de imágenes o PDFs escaneados mediante OCR (reconocimiento óptico de caracteres) combinado con comprensión estructural del documento, transformando un documento visual no estructurado en datos estructurados consumibles programáticamente (por ejemplo, extraer automáticamente los campos de una factura escaneada hacia un registro de base de datos), evitando el trabajo manual de transcripción de documentos que de otra forma requeriría intervención humana.

```bash
aws transcribe start-transcription-job --transcription-job-name mi-transcripcion --media '{"MediaFileUri":"s3://mi-bucket/audio.mp3"}' --output-bucket-name mi-bucket
```

Transcribe convierte audio hablado en texto escrito (speech-to-text), un proceso asíncrono (se inicia el job y se consulta su estado posteriormente, similar al patrón de invocación asíncrona ya visto con otras operaciones de larga duración) apropiado para transcribir grabaciones de llamadas, reuniones, o contenido de audio hacia texto buscable y procesable, ambos servicios (Textract y Transcribe) representando la categoría de servicios de IA especializada preentrenada para una tarea específica bien definida, en contraste con Bedrock que expone modelos generativos de propósito más general.

**Analogía:** Textract es como un asistente que lee automáticamente documentos escaneados y extrae la información relevante hacia un formulario estructurado, sin requerir que un humano transcriba manualmente cada campo; Transcribe es como un taquígrafo automático que convierte una grabación de audio hablado en un documento de texto completo y buscable.

**¿Por qué es importante?** Textract y Transcribe extraen información estructurada de formatos no estructurados (imágenes, audio) automáticamente, evitando transcripción manual humana, representando servicios de IA especializada preentrenada para tareas específicas bien definidas.

**Diagrama:**

```
Textract:   imagen/PDF escaneado → texto + estructura (tablas, formularios)
Transcribe: audio hablado → texto escrito, buscable y procesable
```

### Tema 3: Stub vs mock, y qué probar localmente

**Conceptos clave:** distinguir qué se puede verificar con confianza localmente frente a lo que requiere el servicio real.

Un stub (usado por cloud local para Bedrock) es una implementación que devuelve respuestas predefinidas y deterministas, útil para verificar que la aplicación maneja correctamente la estructura esperada de una respuesta (¿el código extrae correctamente el campo de texto generado de la respuesta JSON? ¿maneja correctamente un código de error?); un mock, en el sentido más estricto usado en testing (Módulo 9 de varios tracks de esta Academia), típicamente además verifica que se invocó de una forma específica esperada (con ciertos argumentos, un número específico de veces). En la práctica de cloud local, "stub" describe con más precisión el comportamiento: una respuesta fija y predecible, sin verificación de la forma exacta de la invocación en sí misma.

Documentar explícitamente qué partes de la arquitectura de IA se pueden probar localmente con el stub (la estructura del contrato de integración: parseo de request/response, manejo de errores de API, flujo completo de la aplicación) frente a qué partes requieren necesariamente el modelo real de AWS para una validación completa (la calidad y relevancia real del contenido generado, el comportamiento ante prompts ambiguos o adversariales, los límites reales de tokens y su impacto en respuestas truncadas) es una práctica de ingeniería madura que evita la falsa confianza de asumir que pasar pruebas contra el stub garantiza que el sistema de IA completo funcionará correctamente en producción sin ninguna validación adicional contra el servicio real.

**Analogía:** un stub es como un guion de práctica con respuestas fijas y predecibles para ensayar el protocolo de una conversación; un mock añade además la verificación de que se siguieron exactamente los pasos esperados del guion. Documentar qué se prueba localmente frente a qué requiere el entorno real es como distinguir entre un simulacro de emergencia (que verifica el protocolo de procedimiento) y el manejo real de una emergencia genuina (que pone a prueba capacidades que el simulacro no puede replicar completamente).

**¿Por qué es importante?** Un stub devuelve respuestas fijas deterministas sin verificar la forma de invocación (a diferencia de un mock más estricto); documentar qué se prueba localmente frente a lo que requiere el modelo real evita la falsa confianza de asumir cobertura completa solo por pasar pruebas contra el stub.

**Diagrama:**

```
Stub Bedrock (cloud local)   → verifica: estructura de request/response, manejo de errores de API
Bedrock real (AWS)           → verifica: calidad del contenido generado, comportamiento ante prompts reales
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una API que procesa documentos con Textract, guarda el texto en DynamoDB y genera un resumen con Bedrock.

**Requisitos previos:** Módulo 19 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Invocar un modelo de Bedrock Runtime | `aws bedrock-runtime invoke-model` | Observa la respuesta stub determinista |
| 2 | Extraer texto de una imagen con Textract | `aws textract analyze-document --feature-types TABLES FORMS` | OCR + estructura |
| 3 | Transcribir un audio con Transcribe | `aws transcribe start-transcription-job` | Proceso asíncrono |
| 4 | Escribir una prueba de contrato para el stub | Ver Tema 3 | Verifica estructura, no contenido exacto |
| 5 | Documentar qué partes requieren AWS real | Ver Tema 3 | Contratos locales vs validación real |

**Verificación:** el laboratorio se considera exitoso si la API procesa correctamente un documento (extrae texto, lo guarda, genera un resumen), y si la prueba de contrato verifica la estructura de la respuesta del stub sin depender de un contenido exacto no determinista.

**Errores comunes y soluciones**

- **Asumir que pasar pruebas contra el stub de Bedrock garantiza calidad del contenido generado en producción.** Documenta explícitamente qué requiere validación contra el modelo real.
- **Escribir aserciones sobre el contenido exacto de una respuesta de IA real esperando determinismo.** Los modelos reales no son deterministas; verifica estructura, no contenido exacto, en pruebas automatizadas.
- **Confundir un stub simple con un mock que verifica invocaciones.** Distingue el propósito de cada uno según lo que necesitas verificar.

---

## Ejercicios de evaluación

### Ejercicio 1: Diferencia entre stub y mock

**Enunciado:** ¿qué diferencia hay entre un stub y un mock?

**Solución esperada:** un stub devuelve respuestas predefinidas y deterministas sin verificar la forma exacta de la invocación; un mock, en un sentido más estricto, además verifica que se invocó de una forma específica esperada (con ciertos argumentos, un número determinado de veces), agregando una capa de verificación de comportamiento sobre la simple sustitución de respuesta.

**Criterios de éxito:**
- Distingue correctamente la verificación adicional de invocación del mock frente al stub simple.

### Ejercicio 2: Qué contratos se pueden probar localmente

**Enunciado:** ¿qué contratos puedes probar localmente y cuáles necesitan el modelo real?

**Solución esperada:** localmente se puede probar la estructura del contrato de integración (parseo de request/response, manejo de errores de API, flujo completo de la aplicación); se necesita el modelo real para validar la calidad y relevancia del contenido generado, el comportamiento ante prompts ambiguos, y los límites reales de tokens.

**Criterios de éxito:**
- Distingue correctamente estructura de integración (local) de calidad de contenido generativo (requiere modelo real).

### Ejercicio 3: Por qué cloud local usa stubs deterministas para IA

**Enunciado:** ¿por qué cloud local usa stubs deterministas para IA en vez de modelos reales?

**Solución esperada:** los modelos de lenguaje reales son demasiado grandes y computacionalmente costosos para ejecutarse localmente de forma práctica; un stub determinista permite en cambio escribir pruebas automatizadas confiables sobre la estructura del flujo de integración, sin la variabilidad no determinista inherente de un modelo real que haría frágil cualquier aserción de prueba.

**Criterios de éxito:**
- Explica correctamente la impracticabilidad computacional y la necesidad de determinismo para pruebas confiables.

---

## Resumen del módulo

**Puntos clave**

- cloud local emula Bedrock con respuestas stub deterministas, permitiendo pruebas automatizadas confiables sobre la estructura de integración.
- Textract y Transcribe extraen información estructurada de imágenes y audio automáticamente, evitando transcripción manual humana.
- Un stub devuelve respuestas fijas sin verificar la invocación; un mock más estricto también verifica la forma de la invocación.
- Documentar qué contratos se prueban localmente frente a lo que requiere el modelo real evita falsa confianza de cobertura completa.

**Conceptos aprendidos**

- Bedrock Runtime.
- InvokeModel API.
- Textract (OCR).
- Transcribe (STT).
- Stub vs Mock.
- Prompt engineering.
- Token limits.

**Próximos pasos**

En el Módulo 21, el proyecto integrador final, construirás la misma API en AWS, Azure y GCP local, demostrando portabilidad de conocimiento entre proveedores.

**Recursos adicionales**

- Documentación oficial de Amazon Bedrock (docs.aws.amazon.com/bedrock).
