# Módulo 6: Seguridad, privacidad y modelado de amenazas


## Aprende construyendo

### Tema 1: Activos, amenazas, riesgos y límites de confianza

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este fundamento desde cero. Prerrequisitos: terminal, editor y las herramientas indicadas por el tema. Verifica sus versiones antes de empezar.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta idea ayuda a construir, proteger, medir o explicar una plataforma de entregas con decisiones verificables.

#### Paso 3 · Teoría, modelo mental y analogía
Define conceptos, entradas, salidas, límites y una analogía cotidiana; distingue una hipótesis de una garantía y registra qué evidencia la respalda.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-fundamentos-avanzado
cd ejemplo-fundamentos-avanzado
python --version
mkdir src docs
printf "evidencia\n" > docs/README.md
cat docs/README.md
```
Crea src/ejemplo.txt con el modelo mínimo del tema y explica cada línea y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una precondición para provocar un fallo deliberado; lee el diagnóstico, formula una hipótesis y corrígela. Resultado esperado: evidencia reproducible y regla explícita.

#### Paso 6 · Práctica independiente
Construye una variante con un caso normal, uno límite y uno inválido; compara dos alternativas y documenta coste, riesgo y decisión.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida, diagnóstico y reflexión; como siguiente paso conecta el fundamento con el track técnico elegido. Errores comunes: afirmar sin medir, ignorar límites, copiar comandos y no documentar recuperación. Fuentes oficiales: https://www.cs2023.org/ y https://www.swebok.org/.
**¿Por qué es importante?** Porque los fundamentos permiten comprender y diagnosticar cualquier stack.
**Evidencia de aprendizaje:** entrega modelo, ejemplo, fallo, corrección, comparación y conclusión.
**Conceptos clave:** activo, actor, amenaza, vulnerabilidad, control, impacto, probabilidad, riesgo, superficie de ataque, límite de confianza y STRIDE.

Seguridad no empieza instalando una librería. Empieza preguntando qué debe protegerse, de quién y con qué consecuencias. Un **activo** puede ser credenciales, inventario, disponibilidad o reputación. Una amenaza es un evento potencial; una vulnerabilidad es una debilidad explotable; un control reduce probabilidad o impacto. Riesgo combina contexto, no solo severidad técnica.

Dibuja un flujo de datos: usuario → interfaz → aplicación → base. Marca límites donde cambia confianza: Internet a servidor, proceso a base, CI a nube. Para cada flujo aplica STRIDE como lista de preguntas: suplantación, manipulación, repudio, divulgación, denegación y elevación de privilegio.

```mermaid
flowchart LR
    USER["Usuario no confiable"] -->|"credenciales"| APP["Aplicación"]
    APP -->|"SQL parametrizado"| DB["Base de datos"]
    USER -. "límite Internet" .-> APP
    APP -. "límite de proceso" .-> DB
```

Ejemplo: activo “stock correcto”; amenaza “operador modifica productos ajenos”; vulnerabilidad “endpoint no comprueba rol”; control “autorización en servidor + audit log + prueba negativa”. “Usar HTTPS” no corrige autorización: protege tránsito, no decide permisos.

Prioriza con impacto y probabilidad, registra supuestos y propietario. Un riesgo crítico sin responsable es solo una frase. Riesgo residual permanece después del control y debe aceptarse, transferirse, reducirse o evitarse conscientemente.

**Analogía:** threat modeling es inspeccionar un edificio antes de instalar cerraduras: identifica objetos valiosos, entradas, personas y consecuencias, en lugar de comprar la cerradura más cara para una puerta irrelevante.

**¿Por qué es importante?** Controles aislados crean falsa seguridad. El modelo conecta requisitos, arquitectura, pruebas y operación.

**Casos de uso reales:** revisión de APIs, pagos, datos personales, pipelines, aplicaciones móviles e infraestructura cloud.

**Diagrama:**

```mermaid
flowchart LR
    THREAT["activo + actor + camino"] --> RISK["impacto y probabilidad"]
    RISK --> CONTROL["control y propietario"] --> RESIDUAL["riesgo residual"]
```

### Tema 2: Identidad, contraseñas, sesiones y autorización

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este fundamento desde cero. Prerrequisitos: terminal, editor y las herramientas indicadas por el tema. Verifica sus versiones antes de empezar.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta idea ayuda a construir, proteger, medir o explicar una plataforma de entregas con decisiones verificables.

#### Paso 3 · Teoría, modelo mental y analogía
Define conceptos, entradas, salidas, límites y una analogía cotidiana; distingue una hipótesis de una garantía y registra qué evidencia la respalda.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-fundamentos-avanzado
cd ejemplo-fundamentos-avanzado
python --version
mkdir src docs
printf "evidencia\n" > docs/README.md
cat docs/README.md
```
Crea src/ejemplo.txt con el modelo mínimo del tema y explica cada línea y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una precondición para provocar un fallo deliberado; lee el diagnóstico, formula una hipótesis y corrígela. Resultado esperado: evidencia reproducible y regla explícita.

#### Paso 6 · Práctica independiente
Construye una variante con un caso normal, uno límite y uno inválido; compara dos alternativas y documenta coste, riesgo y decisión.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida, diagnóstico y reflexión; como siguiente paso conecta el fundamento con el track técnico elegido. Errores comunes: afirmar sin medir, ignorar límites, copiar comandos y no documentar recuperación. Fuentes oficiales: https://www.cs2023.org/ y https://www.swebok.org/.
**¿Por qué es importante?** Porque los fundamentos permiten comprender y diagnosticar cualquier stack.
**Evidencia de aprendizaje:** entrega modelo, ejemplo, fallo, corrección, comparación y conclusión.
**Conceptos clave:** identidad, autenticación, autorización, credencial, password hashing, salt, sesión, token, rol, permiso y mínimo privilegio.

Autenticación responde “¿quién eres?”; autorización responde “¿puedes hacer esto sobre este recurso?”. Un usuario autenticado no obtiene automáticamente permisos administrativos.

Las contraseñas no deben almacenarse en texto ni cifrarse reversiblemente. Se derivan con una función lenta y resistente a ataques, salt aleatorio único y parámetros guardados. En Python estándar:

```python
import hashlib
import hmac
import secrets

def crear_hash(password: str) -> tuple[bytes, bytes]:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode(), salt=salt, n=2**14, r=8, p=1
    )
    return salt, digest

def verificar(password: str, salt: bytes, esperado: bytes) -> bool:
    actual = hashlib.scrypt(
        password.encode(), salt=salt, n=2**14, r=8, p=1
    )
    return hmac.compare_digest(actual, esperado)
```

`secrets` genera salt criptográfico. `scrypt` encarece intentos masivos. `compare_digest` reduce filtraciones por comparación temporal. Los parámetros deben revisarse según entorno; en producción suelen usarse bibliotecas mantenidas con Argon2id/bcrypt/scrypt y políticas de actualización.

Autorización debe ocurrir en el servidor/capa de dominio, no solo ocultando botones:

```python
def eliminar_producto(usuario, producto_id, repositorio):
    if "producto:eliminar" not in usuario.permisos:
        raise PermissionError("Operación no autorizada")
    repositorio.eliminar(producto_id)
```

Prueba usuario anónimo, lector, operador y administrador. Aplica mínimo privilegio y denegación por defecto. Sesiones/tokens requieren expiración, revocación, protección contra robo y almacenamiento apropiado; JWT no resuelve estos problemas por sí mismo.

**Analogía:** mostrar identificación permite entrar al edificio; la autorización determina qué salas puedes abrir. Ocultar el letrero de una puerta no reemplaza la cerradura.

**¿Por qué es importante?** Fallos de control de acceso exponen datos y acciones incluso con login correcto.

**Casos de uso reales:** paneles administrativos, multi-tenant, archivos privados, APIs y operaciones financieras.

**Diagrama:**

```mermaid
flowchart LR
    CRED["credencial"] --> AUTHN["autenticar"] --> ID["identidad"]
    ID --> AUTHZ["autorizar acción + recurso"] --> DECISION["permitir o denegar"]
```

### Tema 3: Criptografía aplicada, TLS, claves y secretos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este fundamento desde cero. Prerrequisitos: terminal, editor y las herramientas indicadas por el tema. Verifica sus versiones antes de empezar.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta idea ayuda a construir, proteger, medir o explicar una plataforma de entregas con decisiones verificables.

#### Paso 3 · Teoría, modelo mental y analogía
Define conceptos, entradas, salidas, límites y una analogía cotidiana; distingue una hipótesis de una garantía y registra qué evidencia la respalda.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-fundamentos-avanzado
cd ejemplo-fundamentos-avanzado
python --version
mkdir src docs
printf "evidencia\n" > docs/README.md
cat docs/README.md
```
Crea src/ejemplo.txt con el modelo mínimo del tema y explica cada línea y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una precondición para provocar un fallo deliberado; lee el diagnóstico, formula una hipótesis y corrígela. Resultado esperado: evidencia reproducible y regla explícita.

#### Paso 6 · Práctica independiente
Construye una variante con un caso normal, uno límite y uno inválido; compara dos alternativas y documenta coste, riesgo y decisión.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida, diagnóstico y reflexión; como siguiente paso conecta el fundamento con el track técnico elegido. Errores comunes: afirmar sin medir, ignorar límites, copiar comandos y no documentar recuperación. Fuentes oficiales: https://www.cs2023.org/ y https://www.swebok.org/.
**¿Por qué es importante?** Porque los fundamentos permiten comprender y diagnosticar cualquier stack.
**Evidencia de aprendizaje:** entrega modelo, ejemplo, fallo, corrección, comparación y conclusión.
**Conceptos clave:** hash, MAC, firma, cifrado simétrico/asimétrico, confidencialidad, integridad, autenticidad, TLS, clave, rotación y secret manager.

Criptografía ofrece propiedades distintas. Un hash detecta cambios, pero no autentica origen si cualquiera puede recalcularlo. Un MAC usa secreto compartido para integridad/autenticidad. Una firma usa clave privada y se verifica con pública. Cifrado protege confidencialidad, pero debe incluir autenticación para detectar manipulación.

No diseñes algoritmos ni combines primitivas por intuición. Usa protocolos y bibliotecas mantenidas. “Base64” no cifra; solo codifica. SHA-256 solo no sirve para contraseñas por ser demasiado rápido. Guardar una clave junto al dato cifrado elimina el beneficio.

TLS protege datos en tránsito y autentica el servidor mediante certificados. Verifica hostname y cadena; desactivar validación para “arreglar” desarrollo entrena una vulnerabilidad. En reposo, el problema central es gestión de claves: creación, permisos, almacenamiento, rotación, revocación y auditoría.

Secretos no pertenecen al repositorio:

```python
import os

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    raise RuntimeError("Falta DATABASE_URL")
```

`.env` local debe ignorarse; `.env.example` contiene nombres sin valores reales. En producción usa gestor de secretos e identidad de workload. Si un secreto entra en Git, borrarlo del último commit no basta: puede permanecer en historial y clones; revócalo/rota primero.

**Analogía:** cifrado es una caja fuerte; gestión de claves decide quién tiene la llave, dónde se guarda y qué ocurre si se copia. Una caja fuerte con llave pegada no protege.

**¿Por qué es importante?** La criptografía correcta puede fallar por claves expuestas, validación desactivada o propósito equivocado.

**Casos de uso reales:** HTTPS, contraseñas, webhooks firmados, discos cifrados, backups y secretos de CI.

**Diagrama:**

```mermaid
flowchart LR
    PROPERTY["propiedad necesaria"] --> PROTOCOL["protocolo mantenido"] --> KEY["clave"]
    KEY --> STORE["almacenamiento"] --> ROTATE["rotación"] --> AUDIT["auditoría"]
```

### Tema 4: Validación, vulnerabilidades web, privacidad y respuesta

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este fundamento desde cero. Prerrequisitos: terminal, editor y las herramientas indicadas por el tema. Verifica sus versiones antes de empezar.

#### Paso 2 · Contexto y caso real
En un caso real de software, esta idea ayuda a construir, proteger, medir o explicar una plataforma de entregas con decisiones verificables.

#### Paso 3 · Teoría, modelo mental y analogía
Define conceptos, entradas, salidas, límites y una analogía cotidiana; distingue una hipótesis de una garantía y registra qué evidencia la respalda.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-fundamentos-avanzado
cd ejemplo-fundamentos-avanzado
python --version
mkdir src docs
printf "evidencia\n" > docs/README.md
cat docs/README.md
```
Crea src/ejemplo.txt con el modelo mínimo del tema y explica cada línea y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una precondición para provocar un fallo deliberado; lee el diagnóstico, formula una hipótesis y corrígela. Resultado esperado: evidencia reproducible y regla explícita.

#### Paso 6 · Práctica independiente
Construye una variante con un caso normal, uno límite y uno inválido; compara dos alternativas y documenta coste, riesgo y decisión.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, salida, diagnóstico y reflexión; como siguiente paso conecta el fundamento con el track técnico elegido. Errores comunes: afirmar sin medir, ignorar límites, copiar comandos y no documentar recuperación. Fuentes oficiales: https://www.cs2023.org/ y https://www.swebok.org/.
**¿Por qué es importante?** Porque los fundamentos permiten comprender y diagnosticar cualquier stack.
**Evidencia de aprendizaje:** entrega modelo, ejemplo, fallo, corrección, comparación y conclusión.
**Conceptos clave:** validación, encoding, inyección, XSS, CSRF, CORS, logging seguro, minimización, retención, incidente y defensa en profundidad.

Valida entrada según el dominio: tipo, longitud, formato, rango y relación. Validar no significa “eliminar caracteres malos” universalmente. Mantén datos y código separados: SQL parametrizado; encoding contextual al renderizar HTML; APIs seguras para comandos.

**Inyección SQL** ocurre cuando entrada altera estructura de consulta. **XSS** ejecuta contenido no confiable como script; la defensa principal es salida codificada/contextual y evitar APIs peligrosas, complementada por CSP. **CSRF** induce al navegador autenticado a enviar una acción; defensas incluyen tokens, SameSite y comprobación de origen. **CORS** controla qué orígenes pueden leer respuestas en navegador; no autentica ni protege una API de clientes no navegador.

```html
<!-- Riesgoso si comentario viene del usuario -->
<div id="comentario"></div>
<script>
  comentario.textContent = datoNoConfiable;
</script>
```

`textContent` trata el valor como texto; `innerHTML` lo interpretaría como marcado. La regla depende del contexto.

Privacidad exige propósito, minimización, retención y derechos. No recopiles fecha de nacimiento si solo necesitas confirmar mayoría de edad. Logs no deben incluir contraseñas, tokens ni datos personales completos. Define tiempo de retención y borrado.

Un incidente necesita preparación: detectar, contener, preservar evidencia, erradicar, recuperar y aprender. El runbook incluye contactos, criterios, rotación, comunicación y verificación. Evita culpar; busca condiciones sistémicas.

**Analogía:** validación controla qué paquetes entran; encoding evita que su etiqueta se interprete como instrucción; privacidad cuestiona si debías recibir el paquete; respuesta define qué hacer si algo peligroso pasó.

**¿Por qué es importante?** Seguridad y privacidad atraviesan código, datos, operación y personas. Un control único nunca cubre todas las capas.

**Casos de uso reales:** formularios, APIs, contenido generado por usuarios, logs, analytics y respuesta a credenciales filtradas.

**Diagrama:**

```mermaid
flowchart LR
    PREVENT["prevenir"] --> DETECT["detectar"] --> RESPOND["responder"]
    RESPOND --> RECOVER["recuperar"] --> LEARN["aprender"] --> PREVENT
```

## Construcción guiada del capítulo

### Proyecto 6: endurecimiento del inventario

1. Crea `threat-model.md` con activos, DFD, límites y al menos 12 amenazas STRIDE.
2. Prioriza cinco riesgos con impacto/probabilidad, control, propietario y residual.
3. Añade tablas de usuarios, roles/permisos y audit events mediante migración.
4. Implementa registro/login local con `scrypt`, salt único y comparación segura.
5. Define permisos `producto:leer`, `producto:editar`, `producto:eliminar` y deniega por defecto.
6. Registra acciones sensibles sin secretos ni contraseñas.
7. Mueve configuración sensible a variables; añade `.env.example` y `.gitignore`.
8. Añade pruebas negativas: anónimo, rol incorrecto, acceso a recurso ajeno, inyección y entrada extrema.
9. Ejecuta escaneo de secretos/dependencias en CI.
10. Escribe `INCIDENT-RUNBOOK.md` para credencial filtrada y corrupción de inventario.

**Verificación:** contraseñas nunca aparecen en claro; salts son distintos; permisos se comprueban en lógica; operaciones denegadas no cambian datos; logs permiten atribución sin filtrar secretos; el runbook puede seguirse.

**Errores comunes y soluciones**

- Inventar cifrado: usa estándares/bibliotecas.
- Autorización solo en UI: verifica servidor/dominio.
- Guardar secretos en Git y luego borrarlos: rota y limpia historial según incidente.
- Registrar requests completos: redacta datos sensibles.
- Tratar CORS como autenticación: exige credenciales/permisos reales.
