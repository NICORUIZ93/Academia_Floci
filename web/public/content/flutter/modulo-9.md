# Módulo 9: Testing en Flutter


## Aprende construyendo

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

**Código del ejemplo:**

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

**Código del ejemplo:**

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
