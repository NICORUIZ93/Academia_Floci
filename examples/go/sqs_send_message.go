// Envia un mensaje a una cola SQS.
// Uso: go run sqs_send_message.go <queue-url> <texto-del-mensaje>
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Uso: go run sqs_send_message.go <queue-url> <texto-del-mensaje>")
	}
	queueURL := os.Args[1]
	body := strings.Join(os.Args[2:], " ")

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

	result, err := client.SendMessage(ctx, &sqs.SendMessageInput{QueueUrl: aws.String(queueURL), MessageBody: aws.String(body)})
	if err != nil {
		log.Fatalf("Error enviando el mensaje: %v", err)
	}
	fmt.Println("Mensaje enviado. MessageId:", aws.ToString(result.MessageId))
}
