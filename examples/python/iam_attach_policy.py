"""Asigna (adjunta) una política IAM a un usuario.

Uso: python3 iam_attach_policy.py <nombre-usuario> <arn-politica>
"""
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
        raise SystemExit("Uso: python3 iam_attach_policy.py <nombre-usuario> <arn-politica>")
    user_name, policy_arn = sys.argv[1], sys.argv[2]

    iam.attach_user_policy(UserName=user_name, PolicyArn=policy_arn)
    print(f"Política {policy_arn} asignada a {user_name}.")

    attached = iam.list_attached_user_policies(UserName=user_name)
    names = [p["PolicyName"] for p in attached["AttachedPolicies"]]
    print("Políticas actualmente asignadas:", names)


if __name__ == "__main__":
    main()
