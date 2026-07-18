# Módulo 30: Transferencia de archivos gestionada con Transfer Family

## Sílabo

**Objetivo general**

Entender el problema que resuelve AWS Transfer Family —ofrecer transferencia de archivos SFTP/FTP gestionada sin operar servidores propios— y dominar su plano de gestión en Floci: ciclo de vida del servidor, gestión de usuarios y claves SSH públicas, entendiendo con claridad qué parte está emulada (la gestión) y qué parte todavía no (la transferencia real de archivos).

**Objetivos específicos**

1. Explicar por qué una empresa elegiría Transfer Family en vez de operar su propio servidor SFTP.
2. Crear un servidor de transferencia gestionado y controlar su ciclo de vida (`OFFLINE`/`ONLINE`).
3. Crear un usuario asociado al servidor e importarle una clave pública SSH.
4. Reconocer los límites de la Fase 1 de esta emulación y qué validarías contra AWS real antes de producción.

**Contenido**

- Qué resuelve Transfer Family frente a un servidor SFTP autogestionado.
- Ciclo de vida del servidor: `CreateServer`, `StartServer`, `StopServer`.
- Usuarios y claves públicas SSH.
- Límites actuales: plano de gestión completo, plano de datos pendiente.

**Evaluación**

Un laboratorio práctico (crear un servidor, un usuario y una clave SSH, y controlar el ciclo de vida del servidor) y tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Qué resuelve Transfer Family

**Conceptos clave:** SFTP/FTP gestionado, sin servidores propios, integración con almacenamiento en la nube.

Muchas industrias —finanzas, salud, logística— todavía dependen de transferencia de archivos por SFTP o FTP como método de intercambio de datos con socios externos, por razones de compatibilidad con sistemas heredados que no van a cambiar pronto. Operar un servidor SFTP propio significa gestionar parches de seguridad, escalado, alta disponibilidad y almacenamiento — trabajo operativo que no aporta valor de negocio directo. AWS Transfer Family resuelve esto ofreciendo un servidor SFTP/FTP completamente gestionado que, en vez de guardar archivos en un disco tradicional, los conecta directamente con almacenamiento en la nube como S3 o EFS: tus socios externos siguen usando las mismas herramientas SFTP de siempre, sin saber ni que les importa que el backend real sea un bucket S3.

Esto es exactamente el tipo de servicio "puente entre lo legado y lo moderno" que aparece una y otra vez en arquitecturas empresariales reales: mantener compatibilidad con protocolos antiguos mientras internamente adoptas infraestructura moderna.

**Analogía:** Transfer Family es como un traductor simultáneo en una reunión internacional: los participantes que solo hablan el idioma antiguo (SFTP) siguen comunicándose exactamente como siempre lo han hecho, mientras que del otro lado de la sala todo se procesa en el idioma moderno (S3) sin que nadie tenga que cambiar sus hábitos.

**¿Por qué es importante?** Reconocer cuándo un problema es "necesito modernizar internamente sin romper compatibilidad externa" —el caso de uso central de Transfer Family— es una habilidad de diseño valiosa en cualquier empresa con sistemas heredados, que son la mayoría de las empresas grandes reales.

### Tema 2: Ciclo de vida del servidor y modelo de usuarios

**Conceptos clave:** `CreateServer`, estado `ONLINE`/`OFFLINE`, `CreateUser`, directorio de inicio.

Crear un servidor de transferencia (`CreateServer`) requiere especificar los protocolos soportados (SFTP es el más común) y el tipo de endpoint. El servidor nace y se puede detener (`StopServer`) o iniciar (`StartServer`) explícitamente, transicionando entre `ONLINE` y `OFFLINE` — un servidor debe estar `OFFLINE` antes de poder eliminarlo, la misma protección contra eliminación accidental de un recurso en uso que ya viste con grupos objetivo de ELB y bóvedas de Backup.

Un usuario (`CreateUser`) se asocia siempre a un servidor específico, con un rol IAM que determina qué permisos tiene sobre el almacenamiento subyacente, y un directorio de inicio que define qué carpeta ve ese usuario al conectarse — el mismo concepto de aislamiento por usuario que tendría cualquier servidor FTP tradicional, solo que aquí ese directorio típicamente mapea a un prefijo dentro de un bucket S3.

**Analogía:** el ciclo de vida `ONLINE`/`OFFLINE` de un servidor Transfer Family es como el horario de atención de una oficina de correos: puedes cerrarla temporalmente para mantenimiento sin desmantelar el edificio completo, y solo la desmantelas (`DeleteServer`) cuando ya está cerrada y vacía.

**¿Por qué es importante?** Practicar la gestión del ciclo de vida completo —crear, detener, reiniciar, eliminar en el orden correcto— es exactamente el tipo de operación que necesitarás automatizar con infraestructura como código en un despliegue real.

### Tema 3: Claves públicas SSH y autenticación de usuarios

**Conceptos clave:** `ImportSshPublicKey`, autenticación por clave, sin validación criptográfica en Floci.

Cada usuario de un servidor Transfer Family se autentica mediante clave pública SSH, no contraseña —la práctica de seguridad estándar para acceso SFTP—: importas la clave pública del usuario con `ImportSshPublicKey`, y a partir de ahí, cualquier cliente que posea la clave privada correspondiente podría (en AWS real) conectarse como ese usuario. Un detalle importante para tu práctica en Floci: los cuerpos de las claves SSH se almacenan y devuelven tal cual, sin ninguna validación criptográfica real de que sean claves válidas — puedes practicar el flujo completo de gestión de claves sin necesidad de generar pares de claves genuinos si solo te interesa validar la lógica de tu infraestructura como código.

Este modelo de autenticación por clave —sin contraseñas que gestionar, rotar o filtrar accidentalmente— es el mismo principio de seguridad que ya reforzaste con IMDS en EC2 y autenticación IAM en ElastiCache: preferir credenciales criptográficas verificables sobre secretos compartidos memorizables.

**Analogía:** una clave SSH importada es como entregarle a alguien una llave física troquelada específicamente para su cerradura, en vez de un código numérico que tendría que memorizar y que podría compartir accidentalmente con alguien más por teléfono.

**¿Por qué es importante?** Que Floci no valide criptográficamente las claves te permite enfocar tu práctica en la lógica de gestión de usuarios y permisos —lo que realmente vas a automatizar con IaC— sin la fricción de generar pares de claves reales solo para probar tu script de aprovisionamiento.

### Tema 4: Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente

**Conceptos clave:** Fase 1, plano de gestión vs plano de datos, transferencia real no emulada.

Como con ELB v2, CloudFront y Route53 en el Módulo 22, Transfer Family en Floci es una implementación de Fase 1: el plano de gestión —crear servidores, usuarios, claves, etiquetas— está completo y es fielmente consultable vía SDK, CLI o Terraform, pero la conectividad SFTP real del plano de datos —efectivamente subir o descargar un archivo por el protocolo SFTP— todavía no está implementada. Puedes validar que tu infraestructura como código crea correctamente el servidor y los usuarios con los permisos esperados, pero no puedes usar un cliente SFTP real para conectarte y transferir un archivo contra Floci todavía.

Reconocer explícitamente esta frontera —qué es plano de gestión emulado vs qué es plano de datos pendiente— es una habilidad que ya has practicado varias veces en este track avanzado: no todos los servicios de Floci tienen el mismo nivel de fidelidad, y usar cada uno sabiendo exactamente qué esperar de él es más valioso que asumir que "todo funciona igual".

**Analogía:** practicar con Transfer Family en su estado actual es como ensayar la coreografía completa de una obra de teatro sin la escenografía final instalada todavía: los movimientos, las entradas y salidas, el guion — todo eso lo puedes ensayar perfectamente; falta el telón de fondo físico para la función completa.

**¿Por qué es importante?** Saber distinguir qué partes de un servicio emulado son completamente confiables para practicar y cuáles requieren validación adicional contra el servicio real antes de producción es, en sí mismo, una competencia profesional importante — la misma que aplicas al leer la documentación de cualquier herramienta nueva que adoptas en un equipo real.

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

**Objetivo del laboratorio:** crear un servidor Transfer Family, controlar su ciclo de vida, crear un usuario e importarle una clave pública SSH, y confirmar el aislamiento correcto de todo el flujo de gestión.

**Requisitos previos:** ninguno adicional a Floci corriendo; puedes generar una clave SSH de prueba con `ssh-keygen -t rsa -f /tmp/clave-prueba` si no tienes una a mano.

### Laboratorio 30.1 — Servidor, usuario y clave SSH

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el servidor | `aws transfer create-server --protocols SFTP --endpoint-type PUBLIC` | Registra un servidor SFTP gestionado | Un `ServerId` con formato `s-...` |
| 2 | Confirma el estado inicial | `aws transfer describe-server --server-id <server-id>` | Verifica el estado del servidor recién creado | Estado `ONLINE` u `OFFLINE` según configuración |
| 3 | Crea un usuario | `aws transfer create-user --server-id <server-id> --user-name alice --role arn:aws:iam::000000000000:role/transfer-role --home-directory /uploads` | Asocia un usuario al servidor con su directorio de inicio | Confirmación del usuario `alice` |
| 4 | Importa su clave pública SSH | `aws transfer import-ssh-public-key --server-id <server-id> --user-name alice --ssh-public-key-body "$(cat /tmp/clave-prueba.pub)"` | Habilita autenticación por clave para ese usuario | Confirmación de la clave importada |
| 5 | Detén y reinicia el servidor | `aws transfer stop-server --server-id <server-id>` luego `aws transfer start-server --server-id <server-id>` | Practica el ciclo de vida completo | El estado transiciona `ONLINE → OFFLINE → ONLINE` |

**Verificación:** el laboratorio se considera exitoso si `describe-user` muestra a `alice` con la clave SSH importada correctamente asociada, y si `describe-server` confirma que el servidor transicionó correctamente de `ONLINE` a `OFFLINE` y de vuelta a `ONLINE` tras los comandos `stop-server` y `start-server`.

**Errores comunes y soluciones**

- **`delete-server` falla inesperadamente.** El servidor debe estar en estado `OFFLINE` antes de poder eliminarse; detén el servidor primero con `stop-server`.
- **Intentas conectarte con un cliente SFTP real y no funciona.** Comportamiento esperado en la Fase 1 actual: solo el plano de gestión está implementado, no la conectividad SFTP real — revisa el Tema 4.
- **`create-user` falla sin un rol IAM válido.** Aunque Floci no valida el rol contra un servicio real de forma estricta, sigue siendo buena práctica usar un ARN de rol bien formado del Módulo 7 para que tu infraestructura como código sea consistente con lo que necesitarías contra AWS real.

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

```bash
aws transfer create-server --endpoint-url http://localhost:4566 \
  --protocols SFTP --identity-provider-type SERVICE_MANAGED
aws transfer list-servers --endpoint-url http://localhost:4566
```

La prueba verifica el plano de gestión. Documenta explícitamente que crear el servidor no demuestra una transferencia SFTP real.

En este módulo entendiste el problema que resuelve AWS Transfer Family —transferencia de archivos SFTP/FTP gestionada, conectada a almacenamiento moderno como S3, sin operar servidores propios— y practicaste su plano de gestión completo en Floci: ciclo de vida del servidor, usuarios con directorios de inicio aislados, y autenticación por clave pública SSH. Reconociste también, con claridad, la frontera de la Fase 1 actual: gestión completamente emulada, transferencia real de archivos todavía pendiente — el mismo ejercicio de "saber qué esperar de cada servicio" que aplicaste con ELB, CloudFront y Route53 en el Módulo 22.
