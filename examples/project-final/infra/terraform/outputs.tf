output "api_invoke_url" {
  description = "URL base de la API desplegada. Prueba con: curl <api_invoke_url>/tareas"
  value       = "${var.floci_endpoint}/restapis/${aws_api_gateway_rest_api.api.id}/${var.environment}/_user_request_"
}

output "table_name" {
  description = "Nombre de la tabla DynamoDB de tareas."
  value       = aws_dynamodb_table.tareas.name
}

output "bucket_name" {
  description = "Nombre del bucket S3 de adjuntos."
  value       = aws_s3_bucket.adjuntos.bucket
}

output "queue_url" {
  description = "URL de la cola SQS de notificaciones."
  value       = aws_sqs_queue.notificaciones.url
}
