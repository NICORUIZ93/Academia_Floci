// Descarga un objeto de S3 a un archivo local.
// Uso: go run s3_download.go <bucket> <clave> [ruta-destino]
package main

import (
	"context"
	"fmt"
	"io"
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
		log.Fatal("Uso: go run s3_download.go <bucket> <clave> [ruta-destino]")
	}
	bucket := os.Args[1]
	key := os.Args[2]
	dest := filepath.Base(key)
	if len(os.Args) > 3 {
		dest = os.Args[3]
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

	result, err := client.GetObject(ctx, &s3.GetObjectInput{Bucket: aws.String(bucket), Key: aws.String(key)})
	if err != nil {
		log.Fatalf("Error descargando (¿existe %q en %q?): %v", key, bucket, err)
	}
	defer result.Body.Close()

	data, err := io.ReadAll(result.Body)
	if err != nil {
		log.Fatalf("Error leyendo el contenido: %v", err)
	}
	if err := os.WriteFile(dest, data, 0o644); err != nil {
		log.Fatalf("Error escribiendo %q: %v", dest, err)
	}
	fmt.Printf("Descargado: s3://%s/%s -> %s (%d bytes)\n", bucket, key, dest, len(data))
}
