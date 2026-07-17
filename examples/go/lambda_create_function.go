// Empaqueta un handler minimo y despliega una funcion Lambda en Floci.
// Uso: go run lambda_create_function.go [nombre-funcion]
package main

import (
	"archive/zip"
	"bytes"
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/aws/aws-sdk-go-v2/service/lambda/types"
)

const handlerCode = `exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: 'Hola desde Lambda en Floci', recibido: event }),
  };
};
`

func buildZip() ([]byte, error) {
	buf := new(bytes.Buffer)
	writer := zip.NewWriter(buf)
	file, err := writer.Create("index.js")
	if err != nil {
		return nil, err
	}
	if _, err := file.Write([]byte(handlerCode)); err != nil {
		return nil, err
	}
	if err := writer.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func main() {
	functionName := "mi-funcion"
	if len(os.Args) > 1 {
		functionName = os.Args[1]
	}

	zipBytes, err := buildZip()
	if err != nil {
		log.Fatalf("Error empaquetando el codigo: %v", err)
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

	_, err = client.CreateFunction(ctx, &lambda.CreateFunctionInput{
		FunctionName: aws.String(functionName),
		Runtime:      types.RuntimeNodejs20x,
		Role:         aws.String("arn:aws:iam::000000000000:role/lambda-role"),
		Handler:      aws.String("index.handler"),
		Code:         &types.FunctionCode{ZipFile: zipBytes},
	})
	if err != nil {
		log.Fatalf("Error creando la funcion: %v", err)
	}
	fmt.Println("Funcion Lambda creada:", functionName)
	fmt.Println("Invocala con: go run lambda_invoke.go", functionName)
}
