// Crea una cola SQS en Floci.
// Uso: go run sqs_create_queue.go [nombre-de-cola]
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
	"github.com/aws/aws-sdk-go-v2/service/sqs"
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
	client := sqs.NewFromConfig(cfg, func(o *sqs.Options) {
		o.BaseEndpoint = aws.String("http://localhost:4566")
	})

	queueName := fmt.Sprintf("mi-cola-%d", time.Now().UnixMilli())
	if len(os.Args) > 1 {
		queueName = os.Args[1]
	}

	result, err := client.CreateQueue(ctx, &sqs.CreateQueueInput{QueueName: aws.String(queueName)})
	if err != nil {
		log.Fatalf("Error creando la cola: %v", err)
	}
	fmt.Println("Cola creada:", queueName)
	fmt.Println("URL:", aws.ToString(result.QueueUrl))
}
