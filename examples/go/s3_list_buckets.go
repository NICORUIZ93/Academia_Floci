// Lista todos los buckets S3 existentes en Floci.
// Uso: go run s3_list_buckets.go
// Requiere: go get github.com/aws/aws-sdk-go-v2/config github.com/aws/aws-sdk-go-v2/service/s3
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func main() {
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

	result, err := client.ListBuckets(ctx, &s3.ListBucketsInput{})
	if err != nil {
		log.Fatalf("Error listando buckets: %v", err)
	}

	if len(result.Buckets) == 0 {
		fmt.Println("No hay buckets todavia. Crea uno con s3_create_bucket.go")
		return
	}
	fmt.Println("Buckets:")
	for _, bucket := range result.Buckets {
		fmt.Printf("  - %s (creado %s)\n", aws.ToString(bucket.Name), bucket.CreationDate)
	}
}
