# Módulo 11: Publicación en App Store

## Sílabo

**Objetivo general**

Llevar la app del simulador a usuarios reales a través de TestFlight y la App Store, entendiendo certificados y provisioning profiles, el proceso de archivado y subida, la configuración de metadata en App Store Connect, y el versionado de builds.

**Objetivos específicos**

1. Configurar un certificado de distribución y un provisioning profile.
2. Archivar la app en Xcode y subirla a App Store Connect.
3. Configurar un grupo de pruebas en TestFlight.
4. Completar la metadata básica en App Store Connect.
5. Incrementar el número de build con una convención clara.

**Contenido**

- Certificados y provisioning profiles.
- TestFlight para pruebas beta.
- App Store Connect: metadata y revisión.
- Versionado y builds.

**Evaluación**

Build subido a TestFlight listo para pruebas internas, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Certificados y provisioning profiles

**Conceptos clave:** distinción entre desarrollo y distribución, vínculo entre identidad, app y dispositivos autorizados.

Un certificado de **desarrollo** firma builds destinados a correr en dispositivos físicos específicamente registrados durante el desarrollo activo, permitiendo probar la app en un iPhone o iPad real del propio equipo antes de cualquier distribución más amplia; un certificado de **distribución** firma builds destinados a TestFlight y a la App Store, un nivel de firma distinto que autoriza la distribución más allá del círculo cerrado de dispositivos de desarrollo registrados manualmente. El provisioning profile vincula estos tres elementos en un único artefacto: el certificado (la identidad criptográfica del desarrollador o la organización), el App ID (el identificador único de la app específica), y, en el caso de perfiles de desarrollo, la lista explícita de dispositivos físicos autorizados a instalar ese build.

Xcode, con la opción "Automatically manage signing" habilitada, gestiona automáticamente la mayor parte de esta configuración para proyectos individuales o equipos pequeños, generando y renovando certificados y perfiles según sea necesario sin intervención manual constante; equipos más grandes o con requisitos de firma más específicos (por ejemplo, distribución empresarial interna fuera de la App Store pública) suelen gestionar estos artefactos manualmente con mayor control.

**Analogía:** un certificado de desarrollo es como un pase de acceso temporal válido únicamente para un grupo específico de personas ya identificadas de antemano; un certificado de distribución es como una autorización de circulación pública más amplia, válida para cualquier destinatario que la reciba a través de un canal oficial de distribución (TestFlight, App Store), sin necesidad de registrar de antemano a cada destinatario individual.

**¿Por qué es importante?** Distinguir certificado de desarrollo de certificado de distribución determina qué builds pueden correr únicamente en dispositivos registrados manualmente frente a builds distribuibles más ampliamente a través de TestFlight o la App Store.

**Diagrama:**

```
Certificado de desarrollo   → builds para dispositivos registrados manualmente durante desarrollo
Certificado de distribución → builds para TestFlight y App Store
Provisioning profile        → vincula certificado + App ID + dispositivos autorizados
```

### Tema 2: Archivar, subir y TestFlight

**Conceptos clave:** proceso formal de empaquetado, validación beta con impacto limitado antes de producción.

```
Product → Archive → Distribute App → App Store Connect
```

Archivar la app en Xcode (`Product → Archive`) produce un artefacto de build de release completamente optimizado y firmado con el certificado de distribución, listo para subirse a través del asistente de distribución directamente hacia App Store Connect, el portal centralizado donde Apple procesa, valida y eventualmente distribuye ese build hacia testers o hacia la App Store pública.

Tras subir el build, este se procesa automáticamente en App Store Connect y queda disponible en TestFlight para testers internos (miembros del propio equipo de desarrollo, hasta 100 personas, sin ninguna revisión previa de Apple requerida para este grupo específico) o testers externos (público más amplio fuera del equipo, que sí requiere pasar por una revisión beta de Apple, más ligera y rápida que la revisión completa exigida para la App Store pública); probar exhaustivamente con TestFlight antes de enviar la app a la revisión completa de la App Store permite detectar problemas (crashes, bugs de UX, malas primeras impresiones) con un grupo controlado y de impacto limitado, evitando que esos mismos problemas se descubran directamente en producción frente a la totalidad de usuarios potenciales.

**Analogía:** TestFlight es como una función de preestreno limitada antes del estreno oficial en cines: permite recoger reacciones y corregir problemas con una audiencia reducida y controlada, antes de exponer la obra completa al público general en el estreno definitivo (la App Store).

**¿Por qué es importante?** Probar con TestFlight antes de enviar a revisión de la App Store detecta problemas con un grupo controlado de impacto limitado, evitando que esos mismos problemas se descubran directamente en producción frente a la totalidad de usuarios potenciales.

**Diagrama:**

```
Xcode Archive → App Store Connect → TestFlight (testers internos/externos) → revisión de Apple → App Store pública
```

### Tema 3: Metadata y versionado

**Conceptos clave:** información obligatoria para la revisión, dos identificadores con propósitos distintos.

App Store Connect requiere completar metadata específica antes de que Apple revise la app: descripción y palabras clave (relevantes para el descubrimiento en la búsqueda de la App Store), capturas de pantalla por cada tamaño de dispositivo soportado, una política de privacidad (obligatoria sin excepción para cualquier app publicada), y la clasificación de edad junto con las respuestas del cuestionario de privacidad que declara explícitamente qué datos recolecta la app y con qué propósito, información que Apple usa para mostrar la etiqueta de privacidad visible a los usuarios antes de descargar la app.

```
CFBundleShortVersionString: 1.3.0   ← versión visible (semver)
CFBundleVersion: 42                  ← número de build, debe incrementar en cada subida
```

`CFBundleShortVersionString` (la versión visible al usuario, típicamente semver) y `CFBundleVersion` (el número de build interno, que debe incrementarse estrictamente en cada subida a App Store Connect) cumplen roles análogos a `versionName` y `versionCode` en Android (Módulo 11 de ese track): uno comunica de forma legible la magnitud del cambio al usuario, el otro es el mecanismo técnico interno que la plataforma usa para ordenar builds inequívocamente y rechazar subidas no incrementales.

**Analogía:** la metadata de App Store Connect es como el expediente completo requerido antes de una inspección oficial: sin cada documento obligatorio (política de privacidad, declaración de qué se recolecta), la inspección ni siquiera puede comenzar formalmente; `CFBundleVersion` es como el número de serie interno incremental de cada lote de producción, mientras `CFBundleShortVersionString` es el nombre comercial visible al consumidor final.

**¿Por qué es importante?** La metadata obligatoria (especialmente la política de privacidad y el cuestionario de privacidad) es un requisito no negociable antes de la revisión; el versionado dual (build interno incremental, versión visible semver) cumple roles distintos y complementarios, igual que en Android.

**Diagrama:**

```
CFBundleShortVersionString: "1.3.0"   → visible al usuario, semver
CFBundleVersion: "42"                  → SIEMPRE incremental, uso interno de Apple
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** subir un build a TestFlight listo para pruebas internas.

**Requisitos previos:** Módulo 10 completado, cuenta de desarrollador de Apple.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Configurar certificado de distribución y provisioning profile | Ver Tema 1 | En la cuenta de desarrollador |
| 2 | Archivar y subir a App Store Connect | `Product → Archive` | Ver Tema 2 |
| 3 | Configurar un grupo de pruebas en TestFlight | App Store Connect | Agregarse como tester |
| 4 | Completar la metadata básica | Ver Tema 3 | Descripción, capturas, política de privacidad |
| 5 | Incrementar el número de build antes de subir | Ver Tema 3 | `CFBundleVersion` |

**Verificación:** el laboratorio se considera exitoso si el build se procesa correctamente en App Store Connect y queda disponible en TestFlight para el grupo de pruebas internas configurado, sin errores de validación de metadata o firma.

**Errores comunes y soluciones**

- **Firmar con un certificado de desarrollo en vez de distribución para subir a TestFlight.** TestFlight requiere específicamente un certificado de distribución.
- **Olvidar incrementar `CFBundleVersion` antes de una nueva subida.** App Store Connect rechaza el build si no es estrictamente mayor al ya subido.
- **Omitir la política de privacidad o el cuestionario de privacidad.** Son requisitos obligatorios antes de que la revisión pueda proceder.

---

## Ejercicios de evaluación

### Ejercicio 1: Diferencia entre certificado de desarrollo y distribución

**Enunciado:** ¿qué diferencia hay entre un certificado de desarrollo y uno de distribución?

**Solución esperada:** un certificado de desarrollo firma builds destinados a correr únicamente en dispositivos físicos registrados manualmente durante el desarrollo; un certificado de distribución firma builds destinados a TestFlight y la App Store, autorizando una distribución más amplia sin necesidad de registrar cada dispositivo individual de antemano.

**Criterios de éxito:**
- Distingue correctamente el alcance de dispositivos autorizados entre ambos tipos de certificado.

### Ejercicio 2: Ventaja de probar con TestFlight antes de la App Store

**Enunciado:** ¿qué ventaja da probar con TestFlight antes de enviar la app a revisión de la App Store?

**Solución esperada:** permite detectar problemas (crashes, bugs de UX) con un grupo controlado y de impacto limitado, evitando que esos mismos problemas se descubran directamente en producción frente a la totalidad de usuarios potenciales tras la publicación completa.

**Criterios de éxito:**
- Explica correctamente la validación con impacto limitado como la ventaja de TestFlight.

### Ejercicio 3: Requisitos obligatorios de metadata

**Enunciado:** ¿qué elemento de metadata es obligatorio sin excepción antes de que Apple revise cualquier app?

**Solución esperada:** la política de privacidad, junto con las respuestas del cuestionario de privacidad que declara qué datos recolecta la app, es un requisito obligatorio sin excepción antes de que la revisión pueda proceder.

**Criterios de éxito:**
- Menciona correctamente la política de privacidad como requisito obligatorio sin excepción.

---

## Resumen del módulo

**Puntos clave**

- Un certificado de desarrollo autoriza dispositivos registrados manualmente; uno de distribución autoriza TestFlight y App Store.
- TestFlight permite validar la app con un grupo controlado (interno sin revisión, externo con revisión beta ligera) antes de la revisión completa.
- App Store Connect requiere metadata obligatoria (descripción, capturas, política de privacidad) antes de la revisión.
- `CFBundleVersion` (incremental, interno) y `CFBundleShortVersionString` (semver, visible) cumplen roles distintos, igual que en Android.

**Conceptos aprendidos**

- Certificados y provisioning profiles.
- TestFlight para pruebas beta.
- App Store Connect: metadata y revisión.
- Versionado y builds.

**Próximos pasos**

En el Módulo 12, el proyecto integrador final, unirás SwiftUI, concurrencia moderna, networking y persistencia en una app real completa.

**Recursos adicionales**

- Documentación oficial de App Store Connect (developer.apple.com/app-store-connect).
