# Módulo 15: Infraestructura como código con CloudFormation

## Sílabo

**Objetivo general**

Definir infraestructura completa en archivos de texto versionables, creando, actualizando y destruyendo recursos con un solo comando en vez de operaciones manuales dispersas en la consola, y entendiendo change sets como el mecanismo de previsualización antes de aplicar cambios reales.

**Objetivos específicos**

1. Escribir un template CloudFormation que defina múltiples recursos relacionados.
2. Desplegar el stack y verificar los recursos creados.
3. Crear y revisar un change set antes de aplicarlo.
4. Destruir el stack completo y verificar que los recursos desaparecen.

**Contenido**

- Stack.
- Template.
- Resource.
- Parameter.
- Output.
- Change set.
- Drift detection.
- Terraform y OpenTofu como alternativa multi-nube.
- AWS CDK.
- Compatibilidad de cloud local con AWS CLI v2, SDK v2/v3, boto3, Go, Rust y Terraform.

**Evaluación**

Stack YAML que despliega S3 + SQS + DynamoDB + Lambda con un solo `aws cloudformation deploy`, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Stack YAML que despliega S3 + SQS + DynamoDB + Lambda con un solo `aws cloudformation deploy`, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
docker --version
aws --version
terraform version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs/cloud/{infra,tests,evidence}
cd academia-labs/cloud
git init
docker compose up -d
```

Trabaja dentro de `academia-labs/cloud`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/cloud/
├─ infra/
│  └─ module-15/
├─ tests/
├─ docs/decisions/
├─ evidence/module-15/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Stack, Template y por qué no crear recursos manualmente con la CLI | `infra/module-15/topic-1-stack-template-y-por-que-no-crear-recursos-manualmente.tf` | prueba + salida observable |
| 2. Change sets | `infra/module-15/topic-2-change-sets.tf` | prueba + salida observable |
| 3. Drift detection, Terraform/CDK, y compatibilidad multi-herramienta | `infra/module-15/topic-3-drift-detection-terraform-cdk-y-compatibilidad-multi-h.tf` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/cloud`:

```bash
terraform -chdir=infra validate
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Stack YAML que despliega S3 + SQS + DynamoDB + Lambda con un solo `aws cloudformation deploy`, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Cambia un endpoint, permiso o identificador por un valor inválido; inspecciona la respuesta del emulador antes de corregir. Guarda en `evidence/module-15/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Infraestructura como código con CloudFormation** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Stack, Template y por qué no crear recursos manualmente con la CLI

**Conceptos clave:** estado deseado declarado una vez, reproducible y versionable.

```yaml
Resources:
  MiBucket:
    Type: AWS::S3::Bucket
  MiCola:
    Type: AWS::SQS::Queue
Outputs:
  NombreBucket:
    Value: !Ref MiBucket
```

```bash
aws cloudformation deploy --template-file stack-basico.yaml --stack-name mi-stack
```

Un template de CloudFormation declara el estado deseado de la infraestructura completa (qué recursos deben existir y cómo deben estar configurados) en un único archivo de texto versionable en el control de versiones junto al resto del código de la aplicación; un stack es la instancia desplegada de ese template, gestionada como una unidad completa por CloudFormation. Crear recursos manualmente con comandos individuales de la CLI (como se hizo en módulos anteriores para aprender cada servicio de forma aislada) funciona bien para exploración y aprendizaje, pero se vuelve insostenible para gestionar infraestructura real: no hay ningún registro versionado de qué comandos exactos se ejecutaron ni en qué orden, recrear la misma infraestructura en un entorno nuevo requiere repetir manualmente cada comando (propenso a errores de omisión), y no existe una forma sencilla de saber qué recursos pertenecen a qué sistema o pueden eliminarse de forma segura sin dejar recursos huérfanos.

CloudFormation resuelve todos estos problemas al tratar la infraestructura completa como una unidad versionada: el mismo template puede desplegarse de forma idéntica y reproducible en múltiples entornos (desarrollo, staging, producción), revisarse como cualquier otro cambio de código antes de fusionarse, y eliminarse por completo con un único comando que CloudFormation garantiza que limpia exactamente los recursos que él mismo creó, sin dejar residuos huérfanos ni requerir que un humano recuerde manualmente cada recurso individual a eliminar.

**Analogía:** un template de CloudFormation es como los planos arquitectónicos completos y versionados de un edificio, permitiendo reconstruir exactamente la misma estructura en cualquier terreno nuevo siguiendo esos planos exactos, en vez de intentar reproducir de memoria una construcción realizada previamente sin ningún plano documentado que la respalde.

**¿Por qué es importante?** CloudFormation ofrece infraestructura versionada, reproducible entre entornos, y con eliminación garantizada sin residuos huérfanos, ventajas concretas frente a crear y gestionar recursos manualmente con comandos individuales de la CLI sin ningún registro estructurado.

**Diagrama:**

```yaml
Resources:
  MiBucket: { Type: AWS::S3::Bucket }
  MiCola: { Type: AWS::SQS::Queue }
Outputs:
  NombreBucket: { Value: !Ref MiBucket }
```

### Tema 2: Change sets

**Conceptos clave:** previsualizar el impacto exacto de un cambio antes de aplicarlo realmente.

```bash
aws cloudformation create-change-set --stack-name mi-stack --template-body file://stack-basico.yaml --change-set-name cambio-001
aws cloudformation describe-change-set --stack-name mi-stack --change-set-name cambio-001
aws cloudformation execute-change-set --stack-name mi-stack --change-set-name cambio-001
```

Un change set calcula y muestra exactamente qué recursos serían creados, modificados o **eliminados** si se aplicara un template modificado, sin aplicar ese cambio todavía: revisar ese change set antes de ejecutarlo permite detectar consecuencias inesperadas de una modificación aparentemente inocua (por ejemplo, cambiar una propiedad de un recurso que CloudFormation solo puede aplicar destruyendo y recreando ese recurso desde cero, perdiendo potencialmente datos si es una base de datos), evitando aplicar un cambio destructivo sin haberlo anticipado explícitamente.

Esta capacidad de previsualización es especialmente crítica en infraestructura de producción, donde un cambio aparentemente menor en el template (modificar un parámetro que en realidad fuerza un reemplazo completo del recurso subyacente) podría causar una interrupción de servicio significativa o pérdida de datos si se aplicara directamente sin revisión previa; revisar el change set convierte ese riesgo implícito en una decisión explícita e informada antes de proceder.

**Analogía:** un change set es como una simulación de construcción que muestra exactamente qué partes de un edificio existente serían modificadas, agregadas o demolidas antes de que la maquinaria pesada real comience a trabajar, permitiendo detectar y cancelar un plan de demolición no intencionado antes de que ocurra de forma irreversible.

**¿Por qué es importante?** Revisar un change set antes de aplicarlo convierte el riesgo implícito de un cambio potencialmente destructivo (reemplazo completo de un recurso, pérdida de datos) en una decisión explícita e informada, evitando sorpresas al aplicar modificaciones de infraestructura en producción.

**Diagrama:**

```bash
create-change-set   → calcula el impacto SIN aplicar el cambio
describe-change-set → revisa exactamente qué se crearía/modificaría/eliminaría
execute-change-set  → aplica el cambio YA revisado y aprobado
```

### Tema 3: Drift detection, Terraform/CDK, y compatibilidad multi-herramienta

**Conceptos clave:** detectar divergencia entre el estado declarado y el estado real.

Drift detection compara el estado actual real de los recursos desplegados contra el estado declarado en el template de CloudFormation, señalando cualquier divergencia (por ejemplo, si alguien modificó manualmente una configuración de un recurso directamente en la consola, fuera del proceso de CloudFormation, sin actualizar el template correspondiente); detectar ese drift es importante porque, sin esa verificación, el template deja de ser una fuente de verdad confiable sobre el estado real de la infraestructura, socavando precisamente el beneficio central de tratar la infraestructura como código versionado y reproducible.

Terraform (y su fork de código abierto OpenTofu) es una alternativa multi-nube a CloudFormation, usando su propio lenguaje declarativo (HCL) con el mismo concepto central de estado deseado (`plan` para previsualizar, análogo a un change set; `apply` para ejecutar), pero con la ventaja de poder gestionar recursos de múltiples proveedores cloud simultáneamente desde un único conjunto de archivos, mientras CloudFormation es específico de AWS; AWS CDK va un paso más allá, permitiendo definir infraestructura usando lenguajes de programación de propósito general reales (TypeScript, Python) en vez de YAML/JSON declarativo puro, generando CloudFormation por debajo, apropiado para equipos que prefieren la expresividad de un lenguaje de programación completo (bucles, funciones, abstracciones reutilizables) sobre la sintaxis más limitada de un template declarativo puro. Cloud local mantiene compatibilidad con todas estas herramientas (AWS CLI v2, los SDKs v2/v3, boto3, Go, Rust, y Terraform) precisamente porque emula las APIs reales de AWS, permitiendo practicar con cualquiera de estas herramientas exactamente como se usarían contra AWS real.

**Analogía:** drift detection es como una auditoría periódica que compara los planos oficiales archivados de un edificio contra su estado físico real, revelando cualquier modificación no documentada realizada fuera del proceso oficial de actualización de planos; Terraform es como un sistema de planificación arquitectónica universal aceptado por constructoras de distintos países (proveedores cloud), mientras CloudFormation es el sistema de planificación específico exigido únicamente por un país en particular (AWS).

**¿Por qué es importante?** Drift detection revela cuándo el estado real diverge del template declarado, preservando la confiabilidad de la infraestructura como código; Terraform/CDK ofrecen alternativas multi-nube o más expresivas respectivamente, y cloud local mantiene compatibilidad con todas ellas al emular las APIs reales.

**Diagrama:**

```
Template declarado ≠ Estado real de los recursos → drift detectado
CloudFormation (específico AWS) vs Terraform/OpenTofu (multi-nube) vs CDK (lenguaje de programación real)
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

**Objetivo del laboratorio:** construir un stack YAML que despliega S3 + SQS + DynamoDB + Lambda con un solo `aws cloudformation deploy`.

**Requisitos previos:** Módulo 14 completado.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Escribir el template con Resources y Outputs | Ver Tema 1 | S3 + SQS + DynamoDB |
| 2 | Desplegar el stack | `aws cloudformation deploy --template-file ... --stack-name mi-stack` | Un solo comando |
| 3 | Verificar los recursos creados | `aws cloudformation describe-stack-resources` | Confirma la creación |
| 4 | Crear, revisar y aplicar un change set | Ver Tema 2 | Con un parámetro nuevo |
| 5 | Destruir el stack completo | `aws cloudformation delete-stack` | Verifica que desaparecen todos los recursos |

**Verificación:** el laboratorio se considera exitoso si el stack completo se despliega y destruye con un único comando cada vez, sin dejar ningún recurso huérfano tras la destrucción, y si el change set revisado refleja correctamente el impacto del cambio antes de aplicarlo.

**Errores comunes y soluciones**

- **Crear recursos manualmente con la CLI para infraestructura de producción.** Usa CloudFormation (o Terraform) para reproducibilidad y versionado.
- **Aplicar un cambio de template sin revisar el change set primero.** Revisa siempre el change set para anticipar reemplazos destructivos.
- **Modificar recursos manualmente en la consola fuera del proceso de CloudFormation.** Provoca drift; usa drift detection para identificarlo y corregirlo.

---

## Ejercicios de evaluación

### Ejercicio 1: Ventaja de CloudFormation frente a la CLI manual

**Enunciado:** ¿qué ventaja tiene CloudFormation frente a crear recursos con la CLI a mano?

**Solución esperada:** CloudFormation trata la infraestructura completa como una unidad versionada y reproducible entre entornos, con eliminación garantizada sin residuos huérfanos; crear recursos manualmente con la CLI no deja ningún registro versionado estructurado y dificulta recrear o eliminar la infraestructura de forma completa y confiable.

**Criterios de éxito:**
- Explica correctamente la reproducibilidad versionada y la eliminación limpia como ventajas de CloudFormation.

### Ejercicio 2: Por qué revisar un change set antes de aplicarlo

**Enunciado:** ¿por qué revisar un change set antes de aplicarlo?

**Solución esperada:** permite anticipar consecuencias inesperadas de una modificación aparentemente inocua (como un reemplazo completo de un recurso que causaría pérdida de datos), convirtiendo el riesgo implícito en una decisión explícita e informada antes de proceder con el cambio real.

**Criterios de éxito:**
- Explica correctamente la anticipación de consecuencias destructivas inesperadas como razón de revisar el change set.

### Ejercicio 3: Qué es drift detection

**Enunciado:** ¿qué es drift detection?

**Solución esperada:** compara el estado actual real de los recursos desplegados contra el estado declarado en el template de CloudFormation, señalando cualquier divergencia causada por modificaciones manuales realizadas fuera del proceso oficial de CloudFormation.

**Criterios de éxito:**
- Explica correctamente la comparación entre estado real y estado declarado como definición de drift detection.

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

- CloudFormation trata la infraestructura completa como una unidad versionada, reproducible entre entornos, con eliminación garantizada sin residuos.
- Un change set previsualiza el impacto exacto de un cambio antes de aplicarlo, convirtiendo riesgos implícitos en decisiones explícitas informadas.
- Drift detection revela cuándo el estado real diverge del template declarado, preservando la confiabilidad de la infraestructura como código.
- Terraform/OpenTofu ofrecen una alternativa multi-nube; AWS CDK permite definir infraestructura con lenguajes de programación reales.

**Conceptos aprendidos**

- Stack, Template, Resource, Parameter, Output.
- Change set.
- Drift detection.
- Terraform y OpenTofu.
- AWS CDK.

**Próximos pasos**

En el Módulo 16 aprenderás orquestación de flujos con Step Functions, coordinando múltiples servicios con lógica condicional y reintentos declarativos.

**Recursos adicionales**

- Documentación oficial de AWS CloudFormation (docs.aws.amazon.com/cloudformation).
