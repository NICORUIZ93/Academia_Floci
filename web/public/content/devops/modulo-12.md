## De Floci a un proveedor real

Todo lo que practicaste en el track Cloud contra Floci usa exactamente las mismas APIs que AWS, Azure o GCP reales. El cambio para ir a producción real es, en esencia: el endpoint (`AWS_ENDPOINT_URL` desaparece, usas el endpoint real del proveedor) y las credenciales (de `test`/`test` a credenciales IAM reales con permisos acotados).

```hcl
# Terraform contra Floci (local)
provider "aws" {
  endpoints = { s3 = "http://localhost:4566" }
}

# Terraform contra AWS real
provider "aws" {
  region = "us-east-1" # sin endpoint custom: apunta directo a AWS
}
```

## Secretos cloud-native

En vez de un `.env` local, en producción usarías AWS Secrets Manager, Azure Key Vault o GCP Secret Manager — los mismos servicios que ya practicaste en el track Cloud (módulo 4), ahora conectados a tu pipeline de CI/CD para inyectar secretos en el momento del despliegue.

## Checklist de salida a producción

- [ ] Observabilidad: logs centralizados, métricas, al menos una alerta configurada
- [ ] Seguridad: secretos fuera del código, imagen escaneada, permisos mínimos
- [ ] Resiliencia: healthchecks, estrategia de rollback probada
- [ ] Costos: límites de autoscaling razonables, recursos etiquetados
- [ ] Documentación: runbook de qué hacer si algo falla a las 3am
