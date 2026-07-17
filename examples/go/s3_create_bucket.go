// Crea un bucket S3 nuevo en Floci.
// Uso: go run s3_create_bucket.go [nombre-del-bucket]
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

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

	bucketName := fmt.Sprintf("mi-bucket-%d", time.Now().UnixMilli())
	if len(os.Args) > 1 {
		bucketName = os.Args[1]
	}

	_, err = client.CreateBucket(ctx, &s3.CreateBucketInput{Bucket: aws.String(bucketName)})
	if err != nil {
		log.Fatalf("Error creando el bucket (¿ya existe %q?): %v", bucketName, err)
	}
	fmt.Println("Bucket creado:", bucketName)
}
