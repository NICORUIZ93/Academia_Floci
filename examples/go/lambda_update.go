// Actualiza el codigo de una funcion Lambda existente y la vuelve a invocar.
// Uso: go run lambda_update.go <nombre-funcion>
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
)

const nuevoHandler = `exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ mensaje: 'Version actualizada del handler', recibido: event }),
  };
};
`

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Uso: go run lambda_update.go <nombre-funcion>")
	}
	functionName := os.Args[1]

	buf := new(bytes.Buffer)
	writer := zip.NewWriter(buf)
	file, err := writer.Create("index.js")
	if err != nil {
		log.Fatalf("Error empaquetando el codigo: %v", err)
	}
	if _, err := file.Write([]byte(nuevoHandler)); err != nil {
		log.Fatalf("Error empaquetando el codigo: %v", err)
	}
	if err := writer.Close(); err != nil {
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

	_, err = client.UpdateFunctionCode(ctx, &lambda.UpdateFunctionCodeInput{
		FunctionName: aws.String(functionName),
		ZipFile:      buf.Bytes(),
	})
	if err != nil {
		log.Fatalf("Error actualizando la funcion: %v", err)
	}
	fmt.Println("Codigo actualizado para:", functionName)

	invoked, err := client.Invoke(ctx, &lambda.InvokeInput{
		FunctionName: aws.String(functionName),
		Payload:      []byte(`{"prueba": "post-actualizacion"}`),
	})
	if err != nil {
		log.Fatalf("Error invocando tras actualizar: %v", err)
	}
	fmt.Println("Respuesta tras actualizar:", string(invoked.Payload))
}
