# TLS / HTTPS

Floci admite TLS opcional, lo que habilita `https://` para todos los puntos finales REST/JSON/Query y `wss://` para conexiones WebSocket. Tanto HTTP como HTTPS se sirven simultáneamente (paridad LocalStack).

## Inicio rápido

```bash
docker run -e FLOCI_TLS_ENABLED=true -p 4566:4566 floci/floci:latest
```

Luego apunte su SDK a `https://localhost:4566`. Dado que el certificado está autofirmado, deshabilite la verificación TLS en su cliente:

```bash
# AWS CLI
aws --endpoint-url https://localhost:4566 --no-verify-ssl sts get-caller-identity

# Node.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node app.js

# Python (boto3)
import boto3
client = boto3.client('sts', endpoint_url='https://localhost:4566', verify=False)
```

## Configuración

| Variable de entorno | Predeterminado | Descripción |
|---------------------|---------|-------------|
| `FLOCI_TLS_ENABLED` | `false` | Habilite TLS/HTTPS en el servidor |
| `FLOCI_TLS_CERT_PATH` | *(desarmado)* | Ruta al archivo de certificado PEM |
| `FLOCI_TLS_KEY_PATH` | *(desarmado)* | Ruta al archivo de clave privada PEM |
| `FLOCI_TLS_SELF_SIGNED` | `true` | Generar automáticamente un certificado autofirmado cuando no se proporcionan rutas de certificado/clave |

## Certificado autofirmado

Cuando `FLOCI_TLS_ENABLED=true` y no se proporciona ningún certificado personalizado, Floci genera automáticamente un certificado autofirmado al inicio. El certificado:

- Se conserva en `{persistent-path}/tls/` y se reutiliza en los reinicios.
- Incluye `localhost`, `127.0.0.1`, `0.0.0.0`, `*.localhost`, `localhost.floci.io` y `*.localhost.floci.io` como nombres alternativos de sujeto (SAN)
- Incluye automáticamente nombres de host personalizados de `FLOCI_HOSTNAME` y `FLOCI_BASE_URL` en las SAN
- Se regenera cuando la configuración del nombre de host cambia entre reinicios.

### Soporte de nombre de host personalizado

Si configura `FLOCI_HOSTNAME` o utiliza un host personalizado en `FLOCI_BASE_URL`, el certificado autofirmado incluye automáticamente esos nombres de host en sus SAN. Esto es esencial para las configuraciones de Docker Compose donde los contenedores hacen referencia a Floci por nombre de servicio:

```yaml
services:
  floci:
    image: floci/floci:latest
    environment:
      FLOCI_TLS_ENABLED: "true"
      FLOCI_HOSTNAME: floci
    ports:
      - "4566:4566"

  app:
    environment:
      AWS_ENDPOINT_URL: "https://floci:4566"
      NODE_TLS_REJECT_UNAUTHORIZED: "0"
```

El certificado generado incluirá `floci` en sus SAN, por lo que la validación de TLS se realizará correctamente cuando `app` se conecte a `https://floci:4566`.

## Certificados proporcionados por el usuario

Para utilizar su propio certificado (por ejemplo, de una CA corporativa o mkcert):

```bash
docker run \
  -e FLOCI_TLS_ENABLED=true \
  -e FLOCI_TLS_CERT_PATH=/certs/server.crt \
  -e FLOCI_TLS_KEY_PATH=/certs/server.key \
  -v ./certs:/certs:ro \
  -p 4566:4566 \
  floci/floci:latest
```

Cuando se proporcionan rutas de certificado personalizadas, se ignora `FLOCI_TLS_SELF_SIGNED` y no se genera ningún certificado autofirmado.

## WebSocket (wss://)

Cuando TLS está habilitado, las conexiones WebSocket usan automáticamente `wss://`:

```
wss://localhost:4566/ws/{apiId}/{stage}
```

No se necesita configuración adicional: Vert.x maneja TLS en la capa de transporte de forma transparente.

## Ejemplos de configuración de SDK

### AWS SDK para JavaScript v3

```typescript
import { STSClient } from '@aws-sdk/client-sts';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import https from 'node:https';

const client = new STSClient({
  endpoint: 'https://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  requestHandler: new NodeHttpHandler({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  }),
});
```

O configure la variable de entorno globalmente:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vitest run
```

### AWS SDK para Java v2

```java
SdkHttpClient httpClient = ApacheHttpClient.builder()
    .tlsTrustManagersProvider(() -> {
        TrustManager[] trustAll = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            }
        };
        return trustAll;
    })
    .build();

StsClient sts = StsClient.builder()
    .endpointOverride(URI.create("https://localhost:4566"))
    .httpClient(httpClient)
    .build();
```

### Python (boto3)

```python
import boto3

client = boto3.client(
    'sts',
    endpoint_url='https://localhost:4566',
    verify=False,  # Disable TLS verification for self-signed cert
    region_name='us-east-1',
    aws_access_key_id='test',
    aws_secret_access_key='test',
)
```

## ¿Cuándo debo desactivar la verificación de TLS?

| Tipo de certificado | ¿Verificación deshabilitada? | Por qué |
|-----------|----------------------|-----|
| Floci autofirmado (predeterminado) | **Sí** — `NODE_TLS_REJECT_UNAUTHORIZED=0`, `verify=False`, etc. | La CA autofirmada no está en el almacén de confianza de su sistema |
| `mkcert` con CA local instalada | **No** | `mkcert -install` agrega su CA raíz al almacén de confianza del sistema operativo |
| CA corporativa/interna ya confiable | **No** | Su sistema operativo o JVM ya confía en la CA emisora ​​|
| CA pública (Let's Encrypt, etc.) | **No** | Confiable de forma predeterminada en todos los tiempos de ejecución |

En resumen: solo necesita deshabilitar la verificación cuando el emisor del certificado **no** está en la cadena de confianza del cliente. Si proporciona su propio certificado a través de `FLOCI_TLS_CERT_PATH` y su sistema ya confía en su CA, no se necesita ninguna configuración de cliente adicional.

## Solución de problemas

**Errores de certificado después de cambiar `FLOCI_HOSTNAME`.**
Floci detecta cambios en la configuración del nombre de host y regenera el certificado automáticamente. Si aún ve errores, elimine el directorio `{persistent-path}/tls/` y reinicie.

**`DEPTH_ZERO_SELF_SIGNED_CERT` en Node.js.**
Esto sólo ocurre con los certificados autofirmados. Configure `NODE_TLS_REJECT_UNAUTHORIZED=0` o configure un agente HTTPS personalizado que omita la verificación. Si utiliza `mkcert` y ejecutó `mkcert -install`, este error no debería ocurrir.

**Java `SSLHandshakeException: PKIX path building failed`.**
Para certificados autofirmados: configure un TrustManager de confianza como se muestra arriba, o importe el certificado al almacén de confianza de su JVM con `keytool -importcert`. Para los certificados proporcionados por el usuario de una CA confiable, esto no debería ocurrir.

**El certificado no incluye mi nombre de host personalizado.**
Asegúrese de que `FLOCI_HOSTNAME` o `FLOCI_BASE_URL` esté configurado *antes* de que se inicie Floci. El certificado se genera durante el inicio. Verifique los registros de `TLS: detected custom hostnames: [...]`.
