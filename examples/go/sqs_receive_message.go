// Recibe (hasta 10) mensajes de una cola SQS sin eliminarlos todavia.
// Uso: go run sqs_receive_message.go <queue-url>
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
	if len(os.Args) < 2 {
		log.Fatal("Uso: go run sqs_receive_message.go <queue-url>")
	}
	queueURL := os.Args[1]

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

	result, err := client.ReceiveMessage(ctx, &sqs.ReceiveMessageInput{
		QueueUrl:            aws.String(queueURL),
		MaxNumberOfMessages: 10,
		WaitTimeSeconds:     2,
	})
	if err != nil {
		log.Fatalf("Error recibiendo mensajes: %v", err)
	}

	if len(result.Messages) == 0 {
		fmt.Println("No hay mensajes disponibles ahora mismo.")
		return
	}
	fmt.Printf("%d mensaje(s) recibido(s):\n", len(result.Messages))
	for _, msg := range result.Messages {
		handle := aws.ToString(msg.ReceiptHandle)
		if len(handle) > 20 {
			handle = handle[:20] + "..."
		}
		fmt.Printf("  - %s (ReceiptHandle: %s)\n", aws.ToString(msg.Body), handle)
	}
	fmt.Println("\nUsa sqs_delete_message.go con el ReceiptHandle completo para confirmarlos.")
}
