// Crea una API REST vacia en API Gateway.
// Uso: go run apigateway_create_api.go [nombre-api]
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/apigateway"
)

func main() {
	apiName := "mi-api"
	if len(os.Args) > 1 {
		apiName = os.Args[1]
	}

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		log.Fatalf("Error cargando configuracion: %v", err)
	}
	client := apigateway.NewFromConfig(cfg, func(o *apigateway.Options) {
		o.BaseEndpoint = aws.String("http://localhost:4566")
	})

	result, err := client.CreateRestApi(ctx, &apigateway.CreateRestApiInput{Name: aws.String(apiName)})
	if err != nil {
		log.Fatalf("Error creando la API: %v", err)
	}
	fmt.Println("API REST creada:", apiName)
	fmt.Println("API ID:", aws.ToString(result.Id))
	fmt.Println("Siguiente paso: go run apigateway_create_resource.go", aws.ToString(result.Id))
}
