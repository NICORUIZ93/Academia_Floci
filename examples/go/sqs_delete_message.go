// Elimina (confirma el procesamiento de) un mensaje de una cola SQS.
// Uso: go run sqs_delete_message.go <queue-url> <receipt-handle>
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run sqs_delete_message.go <queue-url> <receipt-handle>")
	}
	queueURL := os.Args[1]
	receiptHandle := os.Args[2]

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("test", "test", "")),
	)
	if err != nil {
		log.Fatalf("Error cargando configuracion: %v", err)
	}
	client := sqs.NewFromConfig(cfg, func(o *sqs.Options) {
		o.BaseEndpoint = aws.String("http://localhost:4566")
	})

	_, err = client.DeleteMessage(ctx, &sqs.DeleteMessageInput{QueueUrl: aws.String(queueURL), ReceiptHandle: aws.String(receiptHandle)})
	if err != nil {
		log.Fatalf("Error eliminando el mensaje (el ReceiptHandle pudo haber expirado): %v", err)
	}
	fmt.Println("Mensaje eliminado de la cola.")
}
