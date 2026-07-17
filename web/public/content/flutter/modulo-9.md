# Módulo 9: Testing en Flutter

## Sílabo

**Objetivo general**

Probar widgets, lógica e interacción completa de extremo a extremo, distinguiendo unit tests de lógica pura, widget tests en un entorno simulado rápido, e integration tests contra un dispositivo real, con mocking de dependencias mediante `mocktail`.

**Objetivos específicos**

1. Escribir un unit test de una función pura con `flutter_test`.
2. Escribir un widget test que monte un widget y verifique su contenido.
3. Simular un tap y verificar el cambio de estado resultante.
4. Mockear una dependencia con `mocktail`.
5. Escribir un integration test end-to-end.

**Contenido**

- Unit tests de lógica pura.
- Widget tests con `WidgetTester`.
- Integration tests end-to-end.
- Mocking de dependencias (`mocktail`).

**Evaluación**

Suite de widget tests sobre una feature completa de la app, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Unit tests y widget tests

**Conceptos clave:** entorno simulado sin dispositivo real, considerablemente más rápido que un test end-to-end.

```dart
test('valida un email correcto', () {
  expect(esEmailValido('ana@ejemplo.com'), isTrue);
});
```

```dart
testWidgets('muestra el título de la tarea', (tester) async {
  await tester.pumpWidget(MaterialApp(home: TarjetaTarea(titulo: 'Comprar leche')));
  expect(find.text('Comprar leche'), findsOneWidget);
});

testWidgets('incrementa el contador al tocar el botón', (tester) async {
  await tester.pumpWidget(MaterialApp(home: Contador()));
  await tester.tap(find.byType(ElevatedButton));
  await tester.pump(); // reconstruye tras el setState
  expect(find.text('1'), findsOneWidget);
});
```

Un unit test verifica lógica pura (como una función de validación) completamente aislada de cualquier widget o UI, la forma más rápida y directa de testear; un widget test usa `WidgetTester` para renderizar un widget en un entorno de renderizado simulado (sin necesidad de un dispositivo físico o emulador completo corriendo), permitiendo verificar tanto el contenido renderizado (`find.text(...).assertExists`) como simular interacciones del usuario (`tester.tap(...)`) y verificar el estado resultante tras esa interacción, todo ejecutándose considerablemente más rápido que si se lanzara la app completa en un dispositivo real.

`tester.pump()` después de simular una interacción fuerza una reconstrucción del árbol de widgets, reflejando el efecto de un `setState()` disparado por esa interacción (Módulo 1); sin esa llamada explícita a `pump()`, el test no vería el resultado de la reconstrucción que la interacción disparó, dado que el entorno de test no ejecuta automáticamente un ciclo continuo de refresco como lo haría un dispositivo real corriendo la app en vivo.

**Analogía:** un unit test es como verificar una fórmula matemática de forma aislada en un pizarrón, sin ningún contexto visual; un widget test es como montar una maqueta simplificada en un taller controlado para verificar cómo se comporta visualmente un componente específico ante ciertas acciones, sin necesidad de construir el edificio completo a tamaño real para esa verificación puntual.

**¿Por qué es importante?** Los widget tests verifican tanto el renderizado como la interacción en un entorno simulado considerablemente más rápido que un dispositivo real, cerrando la brecha entre "la lógica es correcta" (unit test) y "la UI refleja correctamente esa lógica" sin el costo de un integration test completo.

**Diagrama:**

```dart
testWidgets('incrementa el contador al tocar el botón', (tester) async {
  await tester.pumpWidget(MaterialApp(home: Contador()));
  await tester.tap(find.byType(ElevatedButton));
  await tester.pump();
  expect(find.text('1'), findsOneWidget);
});
```

### Tema 2: Mocking con mocktail

**Conceptos clave:** aislar el widget bajo prueba de sus dependencias reales.

```dart
class RepositorioFake extends Mock implements TareaRepository {}

test('el ViewModel carga tareas del repositorio', () async {
  final repo = RepositorioFake();
  when(() => repo.obtenerTodas()).thenAnswer((_) async => [tareaDePrueba]);
  // ...
});
```

`mocktail` genera un mock (una implementación simulada dinámicamente) de una dependencia como `TareaRepository`, permitiendo configurar exactamente qué debe devolver un método específico cuando se invoque (`when(...).thenAnswer(...)`) sin necesidad de una implementación real completa; esto aísla el widget o la lógica bajo prueba de sus dependencias externas reales (una API real, una base de datos real), haciendo el test más rápido (sin latencia de red o disco real) y más confiable (sin depender de la disponibilidad de un servidor externo o el estado de una base de datos real que podría variar entre ejecuciones del test).

Esta necesidad de aislar dependencias externas para hacer los tests más rápidos y confiables es exactamente el mismo principio ya estudiado con repositorios fake en Android (Módulo 9 de ese track) y Kotlin Multiplatform (Módulo 9 de ese track), aunque `mocktail` usa mocks generados dinámicamente en vez de fakes escritos manualmente como implementación completa; ambos enfoques cumplen la misma función de aislamiento, con `mocktail` requiriendo menos código escrito manualmente a cambio de una capa adicional de "magia" en tiempo de ejecución que un fake explícito no tiene.

**Analogía:** mockear una dependencia con `mocktail` es como usar un maniquí programable que responde exactamente como se le indique ante una acción específica de práctica, sin necesidad de contar con la persona o el sistema real completo para ese ensayo puntual, permitiendo repetir el ensayo tantas veces como sea necesario de forma rápida y predecible.

**¿Por qué es importante?** Aislar dependencias externas con `mocktail` hace los widget tests más rápidos (sin latencia real de red/disco) y más confiables (sin depender de la disponibilidad de servicios externos reales que podrían fallar o variar entre ejecuciones del test).

**Diagrama:**

```dart
class RepositorioFake extends Mock implements TareaRepository {}
when(() => repo.obtenerTodas()).thenAnswer((_) async => [tareaDePrueba]);
```

### Tema 3: Integration tests

**Conceptos clave:** validación completa contra un dispositivo o emulador real.

```dart
testWidgets('flujo completo: crear y ver una tarea', (tester) async {
  await tester.pumpWidget(MiApp());
  await tester.tap(find.byIcon(Icons.add));
  await tester.enterText(find.byType(TextField), 'Nueva tarea');
  await tester.tap(find.text('Guardar'));
  await tester.pumpAndSettle();
  expect(find.text('Nueva tarea'), findsOneWidget);
});
```

Un integration test corre contra un dispositivo o emulador real (no el entorno de renderizado simulado de un widget test), validando la integración completa de la app tal como la experimentaría un usuario real, incluyendo la interacción real con plugins nativos, persistencia real, y navegación completa entre pantallas; `tester.pumpAndSettle()` espera a que todas las animaciones y transiciones en curso completen antes de continuar con las siguientes aserciones, apropiado específicamente en este contexto de integración completa donde las transiciones reales sí ocurren, a diferencia de un widget test simulado donde `pump()` simple suele ser suficiente.

Esta distinción de velocidad y alcance (widget test rápido en entorno simulado frente a integration test lento pero completo en dispositivo real) refleja la misma pirámide de tests estudiada en Android con Espresso (Módulo 9 de ese track) y en iOS con XCUITest (Módulo 9 de ese track): la mayoría de la suite debería ser widget tests rápidos, reservando integration tests más costosos para validar únicamente los flujos más críticos de la app de principio a fin.

**Analogía:** un integration test es como una prueba de manejo real completa del vehículo terminado en condiciones de tráfico real, mientras un widget test es como probar un componente específico del vehículo en un banco de pruebas de laboratorio controlado — ambos son necesarios, pero la prueba de manejo real es considerablemente más costosa de repetir con frecuencia.

**¿Por qué es importante?** Un widget test (entorno simulado) es rápido y aísla el componente bajo prueba sin necesidad de dispositivo real; un integration test valida la integración completa contra un dispositivo real, más lento pero necesario para verificar flujos críticos de principio a fin.

**Diagrama:**

```
Unit tests        → lógica pura, sin UI, más rápidos
Widget tests       → entorno simulado, con UI, rápidos
Integration tests   → dispositivo/emulador real, lentos, flujos completos críticos
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

**Objetivo del laboratorio:** construir una suite de widget tests sobre una feature completa de la app.

**Requisitos previos:** Módulo 8 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Unit test de una función pura | Ver Tema 1 | Ej. validación de formulario |
| 2 | Widget test que verifica texto renderizado | Ver Tema 1 | `WidgetTester.pumpWidget` |
| 3 | Simular un tap y verificar el estado resultante | Ver Tema 1 | `tester.tap` + `tester.pump()` |
| 4 | Mockear una dependencia con `mocktail` | Ver Tema 2 | Aísla el widget test |
| 5 | Escribir un integration test end-to-end | Ver Tema 3 | Flujo completo en dispositivo/emulador |

**Verificación:** el laboratorio se considera exitoso si la suite de widget tests pasa consistentemente con dependencias mockeadas (sin llamadas reales de red), y si el integration test completa correctamente el flujo de crear y ver una tarea en un dispositivo o emulador real.

**Errores comunes y soluciones**

- **Olvidar `tester.pump()` tras simular una interacción.** El test no verá el resultado de la reconstrucción disparada por esa interacción.
- **Depender de una API real en un widget test.** Hace el test lento y frágil; mockea la dependencia con `mocktail`.
- **Confiar únicamente en widget tests sin ningún integration test.** No cubre la validación completa de la integración real de la app en un dispositivo.

---

## Ejercicios de evaluación

### Ejercicio 1: Diferencia entre widget test e integration test

**Enunciado:** ¿qué diferencia hay entre un widget test (entorno simulado) y un integration test (dispositivo real)?

**Solución esperada:** un widget test renderiza el widget en un entorno de renderizado simulado sin necesidad de un dispositivo físico, considerablemente más rápido; un integration test corre contra un dispositivo o emulador real, validando la integración completa de la app (plugins nativos, persistencia real, navegación completa) tal como la experimentaría un usuario real, a costa de ser considerablemente más lento.

**Criterios de éxito:**
- Distingue correctamente velocidad y alcance de validación entre ambos tipos de test.

### Ejercicio 2: Por qué mocktail hace los tests más rápidos y confiables

**Enunciado:** ¿por qué aislar dependencias externas con `mocktail` hace los widget tests más rápidos y confiables?

**Solución esperada:** elimina la dependencia de latencia real de red o disco y de la disponibilidad de servicios externos reales que podrían fallar o variar entre ejecuciones, permitiendo que el test corra en milisegundos con un resultado predecible y controlado explícitamente.

**Criterios de éxito:**
- Explica correctamente la eliminación de dependencias externas reales como la razón de rapidez y confiabilidad.

### Ejercicio 3: Por qué usar pumpAndSettle en integration tests

**Enunciado:** ¿por qué `tester.pumpAndSettle()` es apropiado en un integration test pero `tester.pump()` simple suele ser suficiente en un widget test?

**Solución esperada:** en un integration test las animaciones y transiciones reales sí ocurren, por lo que es necesario esperar a que completen todas antes de continuar con las siguientes aserciones; en un widget test simulado, un único `pump()` suele ser suficiente para reflejar la reconstrucción disparada por una interacción simple sin animaciones complejas de por medio.

**Criterios de éxito:**
- Explica correctamente la presencia de animaciones/transiciones reales como razón de usar `pumpAndSettle` en integration tests.

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

- Google, *Flutter Documentation* y guías de arquitectura y rendimiento.
- Google, *Dart Language Documentation* y *Effective Dart*.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Los unit tests verifican lógica pura sin UI; los widget tests renderizan en un entorno simulado rápido, sin dispositivo real.
- `mocktail` aísla dependencias externas, haciendo los tests más rápidos y confiables.
- Los integration tests corren contra un dispositivo real, validando la integración completa a costa de mayor lentitud.
- La mayoría de la suite debería ser widget tests rápidos, reservando integration tests para flujos críticos completos.

**Conceptos aprendidos**

- Unit tests de lógica pura.
- Widget tests con `WidgetTester`.
- Integration tests end-to-end.
- Mocking con `mocktail`.

**Próximos pasos**

En el Módulo 10 aprenderás theming con Material 3, adaptación Material vs Cupertino según plataforma, y accesibilidad con `Semantics`.

**Recursos adicionales**

- Documentación oficial de testing en Flutter (docs.flutter.dev/testing).
