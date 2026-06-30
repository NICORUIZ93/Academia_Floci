## Resources y providers

```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "datos" {
  bucket = "mi-app-datos"
}
```

```bash
terraform init    # descarga el provider
terraform plan     # muestra el diff: qué se creará/cambiará/destruirá
terraform apply     # aplica los cambios
```

**Nunca** edites el archivo de estado (`terraform.tfstate`) a mano — refleja la realidad de la infraestructura y editarlo manualmente puede desincronizarlo del mundo real.

## State remoto y locking

```hcl
terraform {
  backend "s3" {
    bucket = "mi-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}
```

Un backend remoto con locking evita que dos personas apliquen cambios simultáneamente y corrompan el estado.

## Módulos reutilizables

```hcl
module "vpc" {
  source = "./modulos/vpc"
  cidr   = "10.0.0.0/16"
}
```

## Workspaces

```bash
terraform workspace new staging
terraform workspace select prod
```

Permiten mantener estados separados para distintos entornos con el mismo código.
