#!/bin/bash
set -e

echo "Verificando Floci..."

# Cambio P1: la validacion ahora cubre AWS, Azure y GCP.
if curl -s http://localhost:4566/_localstack/health > /dev/null; then
    echo "Floci esta corriendo en http://localhost:4566"
else
    echo "Floci no esta corriendo. Ejecuta: docker compose up -d"
    exit 1
fi

if curl -s http://localhost:4577 > /dev/null; then
    echo "Azure local esta corriendo en http://localhost:4577"
else
    echo "Azure local no responde. Ejecuta: docker compose up -d"
    exit 1
fi

if curl -s http://localhost:4588 > /dev/null; then
    echo "GCP local esta corriendo en http://localhost:4588"
else
    echo "GCP local no responde. Ejecuta: docker compose up -d"
    exit 1
fi

if aws --version > /dev/null 2>&1; then
    echo "AWS CLI instalado"
else
    echo "AWS CLI no instalado"
    exit 1
fi

if aws s3 ls --endpoint-url http://localhost:4566 > /dev/null 2>&1; then
    echo "Conexion a Floci exitosa"
else
    echo "No se puede conectar a Floci"
    exit 1
fi

echo "Floci funciona correctamente"
