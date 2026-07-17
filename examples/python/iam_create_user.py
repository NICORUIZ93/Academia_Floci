"""Crea un usuario IAM.

Uso: python3 iam_create_user.py [nombre-usuario]
"""
import sys

import boto3
from botocore.exceptions import ClientError

iam = boto3.client(
    "iam",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    user_name = sys.argv[1] if len(sys.argv) > 1 else "mi-usuario"
    try:
        result = iam.create_user(UserName=user_name)
    except ClientError as error:
        if error.response["Error"]["Code"] == "EntityAlreadyExists":
            raise SystemExit(f'El usuario "{user_name}" ya existe.')
        raise

    print("Usuario IAM creado:", result["User"]["UserName"])
    print("ARN:", result["User"]["Arn"])
    print("Siguiente paso: python3 iam_create_policy.py")


if __name__ == "__main__":
    main()
