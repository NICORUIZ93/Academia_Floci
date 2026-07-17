"""Lista todos los buckets S3 existentes en Floci.

Uso: python3 s3_list_buckets.py
"""
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
)


def main():
    result = s3.list_buckets()
    buckets = result.get("Buckets", [])
    if not buckets:
        print("No hay buckets todavía. Crea uno con s3_create_bucket.py")
        return
    print("Buckets:")
    for bucket in buckets:
        print(f"  - {bucket['Name']} (creado {bucket['CreationDate']})")


if __name__ == "__main__":
    main()
