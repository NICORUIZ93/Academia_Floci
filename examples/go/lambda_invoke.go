// Invoca una funcion Lambda de forma sincrona y muestra su respuesta.
// Uso: go run lambda_invoke.go <nombre-funcion> [json-de-entrada]
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Uso: go run lambda_invoke.go <nombre-funcion> [json-de-entrada]")
	}
	functionName := os.Args[1]
	payload := `{"origen": "lambda_invoke.go"}`
	if len(os.Args) > 2 {
		payload = os.Args[2]
	}

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		log.Fatalf("Error cargando configuracion: %v", err)
	}
	client := lambda.NewFromConfig(cfg, func(o *lambda.Options) {
		o.BaseEndpoint = aws.String("http://localhost:4566")
	})

	result, err := client.Invoke(ctx, &lambda.InvokeInput{
		FunctionName: aws.String(functionName),
		Payload:      []byte(payload),
	})
	if err != nil {
		log.Fatalf("Error invocando la funcion (¿existe %q?): %v", functionName, err)
	}

	fmt.Println("Status code HTTP de la invocacion:", result.StatusCode)
	if result.FunctionError != nil {
		fmt.Fprintln(os.Stderr, "La funcion termino con error:", aws.ToString(result.FunctionError))
	}
	fmt.Println("Respuesta:", string(result.Payload))
}
