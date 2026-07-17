// Elimina un objeto de S3 (y opcionalmente el bucket si queda vacio).
// Uso: go run s3_delete.go <bucket> <clave> [--bucket-tambien]
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run s3_delete.go <bucket> <clave> [--bucket-tambien]")
	}
	bucket := os.Args[1]
	key := os.Args[2]
	borrarBucket := len(os.Args) > 3 && os.Args[3] == "--bucket-tambien"

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

	if _, err := client.DeleteObject(ctx, &s3.DeleteObjectInput{Bucket: aws.String(bucket), Key: aws.String(key)}); err != nil {
		log.Fatalf("Error eliminando el objeto: %v", err)
	}
	fmt.Printf("Objeto eliminado: s3://%s/%s\n", bucket, key)

	if borrarBucket {
		if _, err := client.DeleteBucket(ctx, &s3.DeleteBucketInput{Bucket: aws.String(bucket)}); err != nil {
			log.Fatalf("Error eliminando el bucket (¿queda vacio?): %v", err)
		}
		fmt.Println("Bucket eliminado:", bucket)
	}
}
