"""Crea una API REST vacía en API Gateway.

Uso: python3 apigateway_create_api.py [nombre-api]
"""
import sys

import boto3

apigateway = boto3.client(
    "apigateway",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    api_name = sys.argv[1] if len(sys.argv) > 1 else "mi-api"

    result = apigateway.create_rest_api(name=api_name)
    print("API REST creada:", api_name)
    print("API ID:", result["id"])
    print("Siguiente paso: python3 apigateway_create_resource.py", result["id"])


if __name__ == "__main__":
    main()
