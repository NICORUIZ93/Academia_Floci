# Patrones en el dominio RutaFlow

Laboratorio independiente, sin conexión al backend de RutaFlow. Código original de la academia para Java 17 o superior; el curso usa JDK 25. Desde la raíz del repositorio:

```sh
java examples/java/patrones-rutaflow/StrategyDemo.java
java examples/java/patrones-rutaflow/SingletonDemo.java
java examples/java/patrones-rutaflow/ObserverDemo.java
```

Salidas esperadas, en el mismo orden:

```text
normal=1500
express=2400
recogida=0
```

```text
misma instancia=true
produccion=COP
prueba=USD
```

```text
cliente=EN_CAMINO
auditoria=EN_CAMINO
auditoria=ENTREGADA
```

Añade `fallo` al final de cada comando para provocar, respectivamente, una distancia negativa, una dependencia global que ignora la configuración inyectada y un observador que impide notificar a los demás. Son excepciones deliberadas de estos ejemplos, no mensajes atribuidos a servicios externos.

La lección `web/public/content/java/modulo-12.md` explica diagnóstico, corrección y ejercicios. No se prometen persistencia, concurrencia ni entrega de eventos entre procesos.
