variable "floci_endpoint" {
  description = "Endpoint local de Floci (todos los servicios AWS en el mismo puerto)."
  type        = string
  default     = "http://localhost:4566"
}

variable "aws_region" {
  description = "Región usada por Floci. Cualquier región válida funciona igual."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefijo usado para nombrar todos los recursos de este proyecto."
  type        = string
  default     = "gestor-tareas"
}

variable "environment" {
  description = "Nombre del stage de API Gateway y sufijo de recursos."
  type        = string
  default     = "dev"
}
