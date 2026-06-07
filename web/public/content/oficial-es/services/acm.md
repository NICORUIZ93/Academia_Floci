# ACM

**Protocolo:** JSON 1.1 (`X-Amz-Target: CertificateManager.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

| Acción | Descripción |
|---|---|
| `RequestCertificate` | Solicitar un nuevo certificado (emitido automáticamente para emulación) |
| `DescribeCertificate` | Obtenga detalles del certificado y estado de validación |
| `GetCertificate` | Recuperar el certificado y la cadena en formato PEM |
| `ListCertificates` | Listar todos los certificados con filtrado de estado opcional |
| `DeleteCertificate` | Eliminar un certificado |
| `AddTagsToCertificate` | Agregar etiquetas a un certificado |
| `RemoveTagsFromCertificate` | Eliminar etiquetas de un certificado |
| `ListTagsForCertificate` | Listar etiquetas para un certificado |
| `ExportCertificate` | Certificado de exportación con clave privada cifrada (solo tipo PRIVADO) |
| `GetAccountConfiguration` | Obtenga la configuración de ACM a nivel de cuenta |
| `PutAccountConfiguration` | Actualizar la configuración de ACM a nivel de cuenta |
| `RenewCertificate` | Activar la renovación del certificado |

## Comportamiento de emulación

- **Emisión automática:** Todos los certificados solicitados se emiten inmediatamente con el estado `ISSUED` (no se requiere validación de DNS/correo electrónico)
- **Criptografía real:** Los certificados se generan con claves RSA/EC reales y estructura X.509 válida.
- **Algoritmos clave:** Compatible con `RSA_2048`, `RSA_3072`, `RSA_4096`, `EC_prime256v1`, `EC_secp384r1`, `EC_secp521r1`.
- **Tipos de certificado:** `AMAZON_ISSUED` (predeterminado) y `PRIVATE` (cuando se proporciona `CertificateAuthorityArn`)
- **Exportar:** Sólo se pueden exportar certificados tipo `PRIVATE` con su clave privada

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ACM_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_ACM_VALIDATION_WAIT_SECONDS` | `0` | Segundos de espera antes de realizar la transición de un certificado de `PENDING_VALIDATION` a `ISSUED` (0 = inmediato) |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Request a certificate
CERT_ARN=$(aws acm request-certificate \
  --domain-name "example.com" \
  --subject-alternative-names "www.example.com" "*.example.com" \
  --validation-method DNS \
  --query CertificateArn --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Describe the certificate
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --endpoint-url $AWS_ENDPOINT_URL

# Get certificate in PEM format
aws acm get-certificate \
  --certificate-arn $CERT_ARN \
  --endpoint-url $AWS_ENDPOINT_URL

# List all certificates
aws acm list-certificates \
  --endpoint-url $AWS_ENDPOINT_URL

# List only issued certificates
aws acm list-certificates \
  --certificate-statuses ISSUED \
  --endpoint-url $AWS_ENDPOINT_URL

# Add tags
aws acm add-tags-to-certificate \
  --certificate-arn $CERT_ARN \
  --tags Key=Environment,Value=Production Key=Project,Value=Demo \
  --endpoint-url $AWS_ENDPOINT_URL

# List tags
aws acm list-tags-for-certificate \
  --certificate-arn $CERT_ARN \
  --endpoint-url $AWS_ENDPOINT_URL

# Request a private certificate (exportable)
PRIVATE_ARN=$(aws acm request-certificate \
  --domain-name "internal.example.com" \
  --certificate-authority-arn "arn:aws:acm-pca:us-east-1:123456789012:certificate-authority/12345678-1234-1234-1234-123456789012" \
  --query CertificateArn --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Export private certificate (passphrase must be base64-encoded, min 4 chars)
PASSPHRASE=$(echo -n "mypassphrase123" | base64)
aws acm export-certificate \
  --certificate-arn $PRIVATE_ARN \
  --passphrase $PASSPHRASE \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete a certificate
aws acm delete-certificate \
  --certificate-arn $CERT_ARN \
  --endpoint-url $AWS_ENDPOINT_URL
```

## SDK Ejemplo (Java)

```java
AcmClient acm = AcmClient.builder()
    .endpointOverride(URI.create("http://localhost:4566"))
    .region(Region.US_EAST_1)
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create("test", "test")))
    .build();

// Request a certificate
RequestCertificateResponse response = acm.requestCertificate(req -> req
    .domainName("example.com")
    .subjectAlternativeNames("www.example.com", "*.example.com")
    .validationMethod(ValidationMethod.DNS));

String certArn = response.certificateArn();

// Describe the certificate
DescribeCertificateResponse desc = acm.describeCertificate(req -> req
    .certificateArn(certArn));

System.out.println("Status: " + desc.certificate().status());
```
