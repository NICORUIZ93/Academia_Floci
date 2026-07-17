# Módulo 1: Programación orientada a objetos

## Sílabo

**Objetivo general**

Aplicar las cuatro bases de la programación orientada a objetos (encapsulación, herencia, polimorfismo, abstracción) con la sintaxis y convenciones reales de Java.

**Objetivos específicos**

1. Crear jerarquías de clases con herencia y sobreescritura de métodos.
2. Definir e implementar interfaces.
3. Diferenciar sobrecarga de sobreescritura.
4. Elegir entre una clase abstracta y una interfaz según el caso.
5. Aplicar correctamente los modificadores de acceso.

**Contenido**

- Clases, herencia e interfaces.
- Polimorfismo y sobrecarga vs sobreescritura.
- Modificadores de acceso.
- Clases abstractas vs interfaces.

**Evaluación**

Jerarquía de clases con al menos una interfaz y una clase abstracta, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Herencia y sobreescritura

**Conceptos clave:** `extends`, `@Override`, polimorfismo de subtipo.

`class Perro extends Animal` establece que `Perro` hereda todos los miembros no privados de `Animal`, pudiendo además sobreescribir (`@Override`) el comportamiento de métodos heredados para especializarlo: `Animal` define `hablar()` devolviendo `"..."`, y `Perro` sobreescribe ese mismo método para devolver `"Guau"`, de modo que invocar `hablar()` sobre una referencia de tipo `Animal` que en realidad apunta a un objeto `Perro` en tiempo de ejecución invoca la versión sobreescrita de `Perro`, no la de `Animal`, un comportamiento llamado polimorfismo de subtipo: el método que efectivamente se ejecuta se determina por el tipo real del objeto en tiempo de ejecución, no por el tipo declarado de la variable que lo referencia.

La anotación `@Override` no es estrictamente obligatoria para que la sobreescritura funcione, pero es una buena práctica fuertemente recomendada: le pide al compilador que verifique que el método efectivamente sobreescribe uno existente en la superclase con la misma firma exacta, detectando en tiempo de compilación errores comunes como escribir mal el nombre del método (creando accidentalmente un método nuevo no relacionado en vez de sobreescribir el esperado) o usar una firma ligeramente distinta a la de la superclase.

**Analogía:** la herencia es como una plantilla base de un formulario que las subclases pueden personalizar, manteniendo la mayoría de los campos originales pero reescribiendo ciertas secciones específicas según sus necesidades particulares; `@Override` es como marcar explícitamente que una sección personalizada efectivamente reemplaza una sección existente de la plantilla original, y no una sección completamente nueva sin relación con la plantilla base.

**¿Por qué es importante?** El polimorfismo de subtipo permite que el mismo código que opera sobre una referencia `Animal` ejecute automáticamente el comportamiento específico de la subclase real en tiempo de ejecución, sin necesidad de conocer de antemano esa subclase concreta.

**Diagrama:**

```java
class Animal {
    String hablar() { return "..."; }
}
class Perro extends Animal {
    @Override
    String hablar() { return "Guau"; }
}
```

### Tema 2: Interfaces, clases abstractas y cuándo usar cada una

**Conceptos clave:** contrato sin implementación, comportamiento compartido parcial, múltiple implementación de interfaces.

Una interfaz (`interface Volador { void volar(); }`) define un contrato puro: qué métodos debe tener cualquier clase que la implemente, sin proporcionar ninguna implementación propia por defecto (salvo métodos `default` explícitamente marcados como tales, un caso especial más avanzado), permitiendo que clases completamente no relacionadas entre sí en su jerarquía de herencia (una clase `Pajaro` y una clase `Avion`, por ejemplo, sin ninguna relación de herencia común) implementen el mismo contrato `Volador`, algo que Java permite hacer con múltiples interfaces simultáneamente (`class Pajaro implements Volador, Comestible`), a diferencia de la herencia de clases, donde Java solo permite extender una única superclase.

Una clase abstracta (`abstract class Forma { abstract double area(); void describir() {...} }`) es apropiada en cambio cuando existe comportamiento genuinamente compartido entre subclases relacionadas entre sí (el método `describir()`, con una implementación concreta compartida por todas las subclases de `Forma`), combinado con métodos abstractos que cada subclase concreta debe implementar por su cuenta (`area()`, sin implementación en la clase abstracta, dado que el cálculo específico depende de qué forma geométrica concreta sea cada subclase). La elección entre ambas se resume en si existe comportamiento compartido real que valga la pena centralizar (clase abstracta) frente a un contrato puro que clases potencialmente no relacionadas deben cumplir (interfaz).

**Analogía:** una interfaz es como un contrato de servicio que múltiples empresas completamente distintas y no relacionadas entre sí pueden firmar, comprometiéndose a ofrecer ciertos servicios específicos sin que el contrato les dicte cómo implementarlos internamente; una clase abstracta es como una franquicia que comparte cierta infraestructura y procedimientos comunes reales entre todas sus sucursales, dejando que cada sucursal específica implemente únicamente los detalles particulares de su operación local.

**¿Por qué es importante?** Elegir entre clase abstracta e interfaz según si existe comportamiento compartido real (clase abstracta) o solo un contrato puro (interfaz) produce un diseño de jerarquía de clases más claro y correctamente alineado con la relación real entre los tipos involucrados.

**Diagrama:**

```java
interface Volador {
    void volar();
}
class Pajaro implements Volador {
    public void volar() { System.out.println("Vuela"); }
}

abstract class Forma {
    abstract double area();              // sin implementación: cada subclase la define
    void describir() { System.out.println("Área: " + area()); } // con implementación, compartida
}
```

### Tema 3: Sobrecarga vs sobreescritura, y modificadores de acceso

**Conceptos clave:** misma firma vs distintas firmas, niveles de visibilidad.

La sobrecarga (overload) define múltiples métodos con el mismo nombre pero distintas firmas (distinto número o tipo de parámetros) dentro de la misma clase: `int sumar(int a, int b)` y `double sumar(double a, double b)` son dos métodos distintos que el compilador resuelve según los tipos de los argumentos pasados en cada llamada específica, una decisión tomada en tiempo de compilación; la sobreescritura (override, Tema 1) redefine el comportamiento de un método heredado con exactamente la misma firma en una subclase, una decisión resuelta en tiempo de ejecución según el tipo real del objeto.

Los modificadores de acceso controlan la visibilidad de un miembro de una clase en círculos concéntricos de alcance creciente: `private` restringe el acceso exclusivamente a la propia clase; sin modificador explícito (package-private, el nivel por defecto cuando no se escribe ninguno) permite acceso desde cualquier clase del mismo paquete; `protected` extiende ese acceso también a subclases, incluso si están en otro paquete distinto; `public` permite acceso desde cualquier lugar sin restricción alguna, la misma jerarquía de visibilidad estudiada de forma más general en el Módulo 4 del track de JavaScript sobre encapsulación, aquí con la sintaxis y granularidad específica de Java.

**Analogía:** la sobrecarga es como tener varias entradas distintas a un mismo edificio, cada una diseñada para un tipo distinto de visitante que llega con diferente equipaje; la sobreescritura es como una sucursal específica de una franquicia que decide atender a sus visitantes de una forma particular y distinta a como lo especifica el manual general de la franquicia, sin cambiar el nombre del procedimiento que sigue.

**¿Por qué es importante?** Sobrecarga y sobreescritura resuelven problemas distintos (múltiples formas de invocar un método según sus argumentos, frente a redefinir el comportamiento heredado); los modificadores de acceso controlan con precisión granular quién puede ver y usar cada miembro de una clase.

**Diagrama:**

```java
int sumar(int a, int b) { return a + b; }
double sumar(double a, double b) { return a + b; } // sobrecarga: misma firma, distintos tipos

// private (solo la clase) < package-private (mismo paquete) < protected (+ subclases) < public (todos)
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una jerarquía de clases con herencia, una interfaz y una clase abstracta.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `Animal` y `Perro` con `@Override` | Ver Tema 1 | Verifica el polimorfismo de subtipo |
| 2 | Definir `Volador` e implementarla en `Pajaro` | Ver Tema 2 | Contrato puro sin implementación |
| 3 | Crear `Forma` abstracta con `Circulo`/`Cuadrado` | Ver Tema 2 | Comportamiento compartido + métodos abstractos |
| 4 | Sobrecargar `sumar()` con distintas firmas | Ver Tema 3 | Compara con sobreescritura |
| 5 | Aplicar `private`/`protected`/`public` | Ver Tema 3 | Explica cuándo usar cada uno |

**Verificación:** el laboratorio se considera exitoso si invocar un método sobre una referencia `Animal` que apunta a un `Perro` ejecuta correctamente la versión sobreescrita, y si la jerarquía distingue apropiadamente qué comportamiento pertenece a una interfaz frente a una clase abstracta.

**Errores comunes y soluciones**

- **Confundir sobrecarga con sobreescritura.** La sobrecarga define métodos con firmas distintas en la misma clase; la sobreescritura redefine un método heredado con la misma firma exacta.
- **Usar una clase abstracta cuando una interfaz sería más apropiada.** Si no hay comportamiento compartido real entre subclases no relacionadas, prefiere una interfaz.
- **Olvidar `@Override` al sobreescribir un método.** Sin ella, el compilador no verifica que efectivamente estás sobreescribiendo un método existente con la firma correcta.

---

## Ejercicios de evaluación

### Ejercicio 1: Sobrecarga vs sobreescritura

**Enunciado:** explica la diferencia entre sobrecargar (overload) y sobreescribir (override) un método.

**Solución esperada:** sobrecargar define múltiples métodos con el mismo nombre pero distintas firmas dentro de la misma clase, resuelto en tiempo de compilación según los argumentos de cada llamada; sobreescribir redefine el comportamiento de un método heredado con exactamente la misma firma en una subclase, resuelto en tiempo de ejecución según el tipo real del objeto.

**Criterios de éxito:**
- Explica correctamente ambos conceptos y el momento de resolución de cada uno (compilación vs ejecución).

### Ejercicio 2: Clase abstracta vs interfaz

**Enunciado:** ¿cuándo usarías una clase abstracta y cuándo una interfaz?

**Solución esperada:** una clase abstracta cuando existe comportamiento genuinamente compartido entre subclases relacionadas entre sí, que vale la pena centralizar; una interfaz cuando se necesita definir un contrato puro que clases potencialmente no relacionadas entre sí (y que Java permite implementar múltiples simultáneamente) deben cumplir.

**Criterios de éxito:**
- Distingue correctamente comportamiento compartido real (clase abstracta) de contrato puro (interfaz).

### Ejercicio 3: Modificadores de acceso

**Enunciado:** ordena los modificadores `private`, package-private (sin modificador), `protected` y `public` de menor a mayor visibilidad, y describe qué agrega cada nivel respecto al anterior.

**Solución esperada:** `private` (solo la propia clase) < package-private (agrega el mismo paquete) < `protected` (agrega subclases, incluso en otros paquetes) < `public` (accesible desde cualquier lugar sin restricción).

**Criterios de éxito:**
- Ordena correctamente los cuatro niveles y describe qué agrega cada uno respecto al anterior.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Oracle, *Java Language Specification* y *Java Virtual Machine Specification*.
- OpenJDK, documentación de Java SE, JFR y JMH.
- Bloch, J., *Effective Java*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- La herencia con `@Override` habilita polimorfismo de subtipo, resuelto según el tipo real del objeto en tiempo de ejecución.
- Una interfaz define un contrato puro implementable por clases no relacionadas; una clase abstracta centraliza comportamiento compartido real.
- Sobrecarga (distintas firmas, misma clase) y sobreescritura (misma firma, subclase) resuelven problemas distintos.
- Los modificadores de acceso controlan visibilidad en niveles concéntricos crecientes.

**Conceptos aprendidos**

- Herencia, `@Override` y polimorfismo de subtipo.
- Interfaces y clases abstractas.
- Sobrecarga vs sobreescritura.
- Modificadores de acceso.

**Próximos pasos**

En el Módulo 2 aprenderás colecciones y genéricos: List, Set, Map, `<T>`, Comparable vs Comparator.

**Recursos adicionales**

- Documentación oficial de Java (docs.oracle.com/en/java): "Interfaces and Inheritance".
