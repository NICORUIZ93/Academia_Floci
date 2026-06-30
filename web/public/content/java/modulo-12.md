## Builder

```java
Pedido pedido = Pedido.builder()
    .cliente("Ana")
    .producto("Laptop")
    .cantidad(2)
    .build();
```

Evita constructores con muchos parámetros (especialmente opcionales) donde es fácil confundir el orden de los argumentos.

## Factory

```java
interface Notificador { void enviar(String mensaje); }

class NotificadorFactory {
    static Notificador crear(String tipo) {
        return switch (tipo) {
            case "email" -> new EmailNotificador();
            case "sms" -> new SmsNotificador();
            default -> throw new IllegalArgumentException("Tipo desconocido");
        };
    }
}
```

## Strategy

```java
interface CalculadoraDescuento { double calcular(double precio); }

class DescuentoNavidad implements CalculadoraDescuento {
    public double calcular(double precio) { return precio * 0.8; }
}

// el código que usa el descuento no sabe (ni le importa) cuál estrategia está activa
double precioFinal = estrategia.calcular(precioOriginal);
```

## SOLID en la práctica

El principio de responsabilidad única (S) es el más fácil de violar sin notarlo: una clase `Pedido` que también envía emails y genera PDFs tiene 3 razones distintas para cambiar — sepáralas en `Pedido`, `EmailService`, `PdfGenerator`.

## Cuándo NO aplicar un patrón

Si una clase Factory solo tiene un caso (`if` con una sola rama), o un Strategy nunca tendrá una segunda implementación real, el patrón agrega indirección sin beneficio — código simple y directo es preferible a flexibilidad que nunca se usa.
