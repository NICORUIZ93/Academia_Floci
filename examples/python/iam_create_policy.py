"""Crea una política IAM de solo lectura sobre un bucket S3 específico
(principio de mínimo privilegio, no AdministratorAccess).

Uso: python3 iam_create_policy.py <nombre-politica> <nombre-bucket>
"""
import json
import sys

import boto3

iam = boto3.client(
    "iam",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    if len(sys.argv) < 3:
        raise SystemExit("Uso: python3 iam_create_policy.py <nombre-politica> <nombre-bucket>")
    policy_name, bucket_name = sys.argv[1], sys.argv[2]

    document = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["s3:GetObject", "s3:ListBucket"],
                "Resource": [f"arn:aws:s3:::{bucket_name}", f"arn:aws:s3:::{bucket_name}/*"],
            }
        ],
    }

    result = iam.create_policy(PolicyName=policy_name, PolicyDocument=json.dumps(document))
    print("Política creada:", result["Policy"]["PolicyName"])
    print("ARN:", result["Policy"]["Arn"])
    print("Siguiente paso: python3 iam_attach_policy.py <usuario>", result["Policy"]["Arn"])


if __name__ == "__main__":
    main()
