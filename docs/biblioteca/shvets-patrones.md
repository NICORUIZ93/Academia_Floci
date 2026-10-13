# Revisión parcial: Sumérgete en los patrones de diseño

Fecha: 2026-10-13. Archivo relativo a la biblioteca: `Programacion/Arquitectura_Patrones_CleanCode/Sumergete en los patrones de diseno - Alexander Shvets.pdf`. Edición visible: v2021-1.7. 437 páginas PDF. La huella está en `catalogo.json`.

## Alcance comprobado

Índice y capítulos Singleton, Observer y Strategy, por extracción de texto. Páginas PDF 5–7, 149–158, 359–374 y 392–406; numeración impresa de capítulos 148–157, 358–373 y 391–405. No se ha revisado el resto del libro ni verificado visualmente todos sus diagramas. La extracción no sustituye esa revisión.

## Hallazgos aplicados

| Hallazgo | Destino | Evidencia |
|---|---|---|
| Separar selección de algoritmo y ejecución | `web/public/content/java/modulo-12.md`, laboratorio Strategy | Tres tarifas, mismo consumidor; distancia negativa rechazada |
| Identidad global frente a dependencias reemplazables | Mismo módulo, laboratorio Singleton | Configuración de prueba USD independiente de COP; fallo por consulta global |
| Ciclo de suscripción y cancelación | Mismo módulo, laboratorio Observer | Cliente recibe primer evento; auditoría recibe ambos |
| Costes de errores y acoplamiento | Límites y ejercicios de los tres laboratorios | Excepción de callback interrumpe la notificación, sin prometer entrega persistente |

Código original: `examples/java/patrones-rutaflow/`. Los ejemplos no reproducen el pseudocódigo del libro. Los matices de Java y decisiones de mensajería son adaptación editorial, no afirmaciones de haber verificado una implementación del libro.

Fuentes de contraste: [Strategy](https://refactoring.guru/design-patterns/strategy), [Singleton](https://refactoring.guru/design-patterns/singleton), [Observer](https://refactoring.guru/design-patterns/observer) y [JLS, enums y campos](https://docs.oracle.com/en/java/javase/26/docs/specs/jls/jls-8.html).

## Temas del índice aún por revisar

Fundamentos POO; relaciones entre objetos; composición frente a herencia; principios SOLID; Factory Method; Abstract Factory; Builder; Prototype; Adapter; Bridge; Composite; Decorator; Facade; Flyweight; Proxy; Chain of Responsibility; Command; Iterator; Mediator; Memento; State; Template Method; Visitor. El índice de esta edición anuncia 22 patrones, no 23.

## Validación ejecutada

En JDK 26.0.2: tres comandos normales terminaron con código 0 y las salidas documentadas; tres comandos con `fallo` terminaron con código 1 y los mensajes esperados. No se ha ejecutado aún en JDK 25. No son pruebas de concurrencia ni de integración con el backend.

## Siguiente lectura

Principios de diseño, páginas PDF 35–75, y Factory Method, páginas PDF 79–95. Comparar con los Temas 1–3 del módulo Java 12 antes de ampliar contenido; registrar cobertura existente y evitar duplicaciones.
