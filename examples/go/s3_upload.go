// Sube un archivo local a un bucket S3 en Floci.
// Uso: go run s3_upload.go <bucket> <ruta-local> [clave-destino]
package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run s3_upload.go <bucket> <ruta-local> [clave-destino]")
	}
	bucket := os.Args[1]
	filePath := os.Args[2]
	key := filepath.Base(filePath)
	if len(os.Args) > 3 {
		key = os.Args[3]
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatalf("Error leyendo %q: %v", filePath, err)
	}

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		log.Fatalf("Error cargando configuracion: %v", err)
	}
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String("http://localhost:4566")
	})

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   bytes.NewReader(data),
	})
	if err != nil {
		log.Fatalf("Error subiendo el archivo: %v", err)
	}
	fmt.Printf("Subido: %s -> s3://%s/%s (%d bytes)\n", filePath, bucket, key, len(data))
}
