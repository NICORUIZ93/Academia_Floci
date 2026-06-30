## Certificados y provisioning profiles

Un certificado de **desarrollo** firma builds para correr en dispositivos físicos registrados durante el desarrollo. Un certificado de **distribución** firma builds para TestFlight y App Store. El provisioning profile vincula el certificado, el App ID y los dispositivos autorizados.

Xcode con "Automatically manage signing" gestiona la mayoría de esto automáticamente para proyectos individuales o equipos pequeños.

## Archivar y subir

```
Product → Archive → Distribute App → App Store Connect
```

## TestFlight

Tras subir el build, se procesa en App Store Connect y queda disponible para testers internos (hasta 100, sin revisión de Apple) o externos (requiere una revisión beta más ligera que la revisión completa de App Store).

## App Store Connect: metadata

- Descripción, palabras clave, capturas de pantalla por tamaño de dispositivo
- Política de privacidad (obligatoria)
- Clasificación de edad y respuestas del cuestionario de privacidad (qué datos recolecta la app)

## Versionado

```
CFBundleShortVersionString: 1.3.0   ← versión visible (semver)
CFBundleVersion: 42                  ← número de build, debe incrementar en cada subida
```
