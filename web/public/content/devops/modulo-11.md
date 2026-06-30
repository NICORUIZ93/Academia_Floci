## Escaneo de imágenes con Trivy

```bash
trivy image mi-api:1.0
```

Reporta vulnerabilidades conocidas (CVEs) en el sistema operativo base y en las dependencias empaquetadas dentro de la imagen.

## Integrarlo en el pipeline

```yaml
- name: Escanear imagen
  run: trivy image --exit-code 1 --severity CRITICAL mi-api:${{ github.sha }}
```

`--exit-code 1` hace que el job (y por lo tanto el pipeline) falle si encuentra vulnerabilidades críticas — la seguridad se valida ANTES del deploy, no después.

## Gestión de secretos

```bash
# Nunca:
const apiKey = "sk-abc123"; // hardcodeado en el código

# Sí: inyectado en runtime desde un gestor de secretos
const apiKey = process.env.API_KEY;
```

Vault y SOPS permiten cifrar secretos y desencriptarlos solo en el momento y lugar correctos, con auditoría de quién accedió a qué.

## Menor privilegio en CI/CD

El token que usa tu pipeline para desplegar no debería tener permisos de administrador sobre toda la infraestructura — solo los permisos mínimos necesarios para esa tarea específica. Si el token se filtra, el daño posible queda acotado.

## SBOM

Un Software Bill of Materials lista exactamente qué dependencias (y qué versiones) contiene tu aplicación — cuando se reporta una vulnerabilidad en una librería específica, puedes responder en minutos "sí/no la usamos" en vez de auditar manualmente.
