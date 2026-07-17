# Infraestructura como código con Terraform (Módulo 8): un módulo reutilizable
# para una instancia EC2, con variables tipadas y un output.
# Nota: para practicar esto contra Floci en vez de AWS real, revisa
# examples/project-final/infra/terraform/ — usa el mismo patrón de endpoints locales.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "ambiente" {
  description = "Nombre del ambiente (dev, staging, prod)"
  type        = string
}

variable "tipo_instancia" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t3.micro"
}

# El estado (state) de Terraform registra qué recursos existen y su
# configuración actual — sin un backend remoto configurado (S3 + DynamoDB
# para locking, típicamente), el estado vive en un archivo local terraform.tfstate,
# que no debe compartirse por git en un equipo real.
resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.tipo_instancia

  tags = {
    Name    = "app-${var.ambiente}"
    Ambiente = var.ambiente
    # Módulo 8: etiquetar todo permite luego auditar costos y ownership con
    # AWS Cost Explorer / Resource Groups Tagging (Módulo 29 del track Cloud).
  }
}

output "ip_publica" {
  description = "IP pública asignada a la instancia"
  value       = aws_instance.app.public_ip
}
