#!/bin/sh
set -eu

export AWS_ENDPOINT_URL="${AWS_ENDPOINT_URL:-http://localhost:4566}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"

aws s3api create-bucket --bucket curso-cloud-local 2>/dev/null || true
aws sqs create-queue --queue-name pedidos >/dev/null

aws dynamodb create-table \
  --table-name Usuarios \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST >/dev/null 2>&1 || true

printf 'Recursos iniciales de la guía creados.\n'

