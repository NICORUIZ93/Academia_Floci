# Infraestructura del Sistema de Gestión de Tareas (Módulo 9) contra Floci.
#
# Uso:
#   floci start                 # o: docker compose up -d
#   cd infra/terraform
#   terraform init
#   terraform apply
#
# Todos los endpoints apuntan a Floci (var.floci_endpoint), no a AWS real.
# Las credenciales "test"/"test" son válidas solo para Floci.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region                      = var.aws_region
  access_key                  = "test"
  secret_key                  = "test"
  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    apigateway     = var.floci_endpoint
    dynamodb       = var.floci_endpoint
    iam            = var.floci_endpoint
    lambda         = var.floci_endpoint
    s3             = var.floci_endpoint
    sqs            = var.floci_endpoint
    sts            = var.floci_endpoint
    cloudwatchlogs = var.floci_endpoint
  }
}

# ── Almacenamiento de datos ───────────────────────────────────────────────

resource "aws_dynamodb_table" "tareas" {
  name         = "${var.project_name}-tareas-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_s3_bucket" "adjuntos" {
  bucket = "${var.project_name}-adjuntos-${var.environment}"
}

resource "aws_sqs_queue" "notificaciones" {
  name = "${var.project_name}-notificaciones-${var.environment}"
}

# ── IAM: rol de ejecución de mínimo privilegio para las Lambdas ───────────

resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lambda_permissions" {
  name = "${var.project_name}-lambda-permissions"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"]
        Resource = aws_dynamodb_table.tareas.arn
      },
      {
        Effect   = "Allow"
        Action   = ["sqs:SendMessage"]
        Resource = aws_sqs_queue.notificaciones.arn
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "*"
      }
    ]
  })
}

# ── Empaquetado y despliegue de las 4 funciones Lambda ────────────────────

data "archive_file" "create_task" {
  type        = "zip"
  source_file = "${path.module}/../../backend/lambda/create-task.js"
  output_path = "${path.module}/.build/create-task.zip"
}

data "archive_file" "list_tasks" {
  type        = "zip"
  source_file = "${path.module}/../../backend/lambda/list-tasks.js"
  output_path = "${path.module}/.build/list-tasks.zip"
}

data "archive_file" "update_task" {
  type        = "zip"
  source_file = "${path.module}/../../backend/lambda/update-task.js"
  output_path = "${path.module}/.build/update-task.zip"
}

data "archive_file" "delete_task" {
  type        = "zip"
  source_file = "${path.module}/../../backend/lambda/delete-task.js"
  output_path = "${path.module}/.build/delete-task.zip"
}

locals {
  lambda_env = {
    TABLE_NAME       = aws_dynamodb_table.tareas.name
    DYNAMODB_ENDPOINT = var.floci_endpoint
    SQS_ENDPOINT     = var.floci_endpoint
    QUEUE_URL        = aws_sqs_queue.notificaciones.url
  }
}

resource "aws_lambda_function" "create_task" {
  function_name    = "${var.project_name}-create-task-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "create-task.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.create_task.output_path
  source_code_hash = data.archive_file.create_task.output_base64sha256
  environment { variables = local.lambda_env }
}

resource "aws_lambda_function" "list_tasks" {
  function_name    = "${var.project_name}-list-tasks-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "list-tasks.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.list_tasks.output_path
  source_code_hash = data.archive_file.list_tasks.output_base64sha256
  environment { variables = local.lambda_env }
}

resource "aws_lambda_function" "update_task" {
  function_name    = "${var.project_name}-update-task-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "update-task.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.update_task.output_path
  source_code_hash = data.archive_file.update_task.output_base64sha256
  environment { variables = local.lambda_env }
}

resource "aws_lambda_function" "delete_task" {
  function_name    = "${var.project_name}-delete-task-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "delete-task.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.delete_task.output_path
  source_code_hash = data.archive_file.delete_task.output_base64sha256
  environment { variables = local.lambda_env }
}

# ── API Gateway: /tareas (GET, POST) y /tareas/{id} (PUT, DELETE) ─────────

resource "aws_api_gateway_rest_api" "api" {
  name = "${var.project_name}-api-${var.environment}"
}

resource "aws_api_gateway_resource" "tareas" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "tareas"
}

resource "aws_api_gateway_resource" "tarea_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.tareas.id
  path_part   = "{id}"
}

# POST /tareas -> create-task
resource "aws_api_gateway_method" "post_tareas" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.tareas.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_tareas" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id              = aws_api_gateway_resource.tareas.id
  http_method              = aws_api_gateway_method.post_tareas.http_method
  integration_http_method  = "POST"
  type                     = "AWS_PROXY"
  uri                      = aws_lambda_function.create_task.invoke_arn
}

# GET /tareas -> list-tasks
resource "aws_api_gateway_method" "get_tareas" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.tareas.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_tareas" {
  rest_api_id              = aws_api_gateway_rest_api.api.id
  resource_id              = aws_api_gateway_resource.tareas.id
  http_method              = aws_api_gateway_method.get_tareas.http_method
  integration_http_method  = "POST"
  type                     = "AWS_PROXY"
  uri                      = aws_lambda_function.list_tasks.invoke_arn
}

# PUT /tareas/{id} -> update-task
resource "aws_api_gateway_method" "put_tarea" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.tarea_id.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "put_tarea" {
  rest_api_id              = aws_api_gateway_rest_api.api.id
  resource_id              = aws_api_gateway_resource.tarea_id.id
  http_method              = aws_api_gateway_method.put_tarea.http_method
  integration_http_method  = "POST"
  type                     = "AWS_PROXY"
  uri                      = aws_lambda_function.update_task.invoke_arn
}

# DELETE /tareas/{id} -> delete-task
resource "aws_api_gateway_method" "delete_tarea" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.tarea_id.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "delete_tarea" {
  rest_api_id              = aws_api_gateway_rest_api.api.id
  resource_id              = aws_api_gateway_resource.tarea_id.id
  http_method              = aws_api_gateway_method.delete_tarea.http_method
  integration_http_method  = "POST"
  type                     = "AWS_PROXY"
  uri                      = aws_lambda_function.delete_task.invoke_arn
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  depends_on = [
    aws_api_gateway_integration.post_tareas,
    aws_api_gateway_integration.get_tareas,
    aws_api_gateway_integration.put_tarea,
    aws_api_gateway_integration.delete_tarea,
  ]

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.tareas.id,
      aws_api_gateway_resource.tarea_id.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.api.id
  stage_name    = var.environment
}
